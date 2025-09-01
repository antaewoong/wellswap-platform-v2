// ⛽ Dynamic Gas Fee Optimization System

import { ethers } from 'ethers';

interface GasPriceData {
  slow: bigint;
  standard: bigint;
  fast: bigint;
  instant: bigint;
  baseFee?: bigint;
  priorityFee?: bigint;
}

interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  totalCost: bigint;
  estimatedTime: string;
}

interface RetryConfig {
  maxRetries: number;
  retryMultiplier: number;
  minRetryDelay: number;
}

export class DynamicGasOptimizer {
  private provider: ethers.JsonRpcProvider;
  private retryConfig: RetryConfig;

  constructor(rpcUrl: string, retryConfig?: Partial<RetryConfig>) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.retryConfig = {
      maxRetries: 3,
      retryMultiplier: 1.2,
      minRetryDelay: 5000, // 5 seconds
      ...retryConfig
    };
  }

  // Get current gas prices from multiple sources
  async getCurrentGasPrices(): Promise<GasPriceData> {
    try {
      // Get base fee from latest block (EIP-1559)
      const latestBlock = await this.provider.getBlock('latest');
      const baseFee = latestBlock?.baseFeePerGas;

      // Get current gas price
      const gasPrice = await this.provider.getFeeData();

      // Calculate different speed options
      const baseGasPrice = gasPrice.gasPrice || BigInt(30000000000); // 30 gwei fallback
      
      const gasPrices: GasPriceData = {
        slow: baseGasPrice * BigInt(80) / BigInt(100),      // 80% of base (cheaper, slower)
        standard: baseGasPrice,                              // 100% of base (normal speed)
        fast: baseGasPrice * BigInt(120) / BigInt(100),     // 120% of base (faster)
        instant: baseGasPrice * BigInt(150) / BigInt(100),  // 150% of base (fastest)
        baseFee,
        priorityFee: gasPrice.maxPriorityFeePerGas
      };

      console.log('🔥 Current gas prices:', {
        slow: `${ethers.formatUnits(gasPrices.slow, 'gwei')} gwei`,
        standard: `${ethers.formatUnits(gasPrices.standard, 'gwei')} gwei`,
        fast: `${ethers.formatUnits(gasPrices.fast, 'gwei')} gwei`,
        instant: `${ethers.formatUnits(gasPrices.instant, 'gwei')} gwei`
      });

      return gasPrices;
    } catch (error) {
      console.error('❌ Failed to get gas prices:', error);
      
      // Fallback gas prices for Polygon
      return {
        slow: BigInt(30000000000),      // 30 gwei
        standard: BigInt(35000000000),  // 35 gwei
        fast: BigInt(45000000000),      // 45 gwei
        instant: BigInt(60000000000),   // 60 gwei
      };
    }
  }

  // Estimate gas for transaction with optimization
  async estimateGasOptimized(
    contractAddress: string,
    data: string,
    from: string,
    value = '0',
    speed: 'slow' | 'standard' | 'fast' | 'instant' = 'standard'
  ): Promise<GasEstimate> {
    try {
      // Get gas prices
      const gasPrices = await this.getCurrentGasPrices();
      
      // Estimate gas limit with 20% buffer
      const estimatedGasLimit = await this.provider.estimateGas({
        to: contractAddress,
        data,
        from,
        value: ethers.parseEther(value)
      });

      const gasLimit = estimatedGasLimit * BigInt(120) / BigInt(100); // Add 20% buffer
      const gasPrice = gasPrices[speed];
      const totalCost = gasLimit * gasPrice;

      // Estimate confirmation time based on speed
      const estimatedTimes = {
        slow: '5-10 minutes',
        standard: '2-5 minutes', 
        fast: '1-2 minutes',
        instant: '30-60 seconds'
      };

      const estimate: GasEstimate = {
        gasLimit,
        gasPrice,
        totalCost,
        estimatedTime: estimatedTimes[speed]
      };

      // Add EIP-1559 fees if available
      if (gasPrices.baseFee && gasPrices.priorityFee) {
        const priorityMultipliers = {
          slow: BigInt(50) / BigInt(100),      // 0.5x priority fee
          standard: BigInt(100) / BigInt(100), // 1x priority fee
          fast: BigInt(150) / BigInt(100),     // 1.5x priority fee
          instant: BigInt(200) / BigInt(100)   // 2x priority fee
        };

        estimate.maxPriorityFeePerGas = gasPrices.priorityFee * priorityMultipliers[speed];
        estimate.maxFeePerGas = gasPrices.baseFee * BigInt(2) + estimate.maxPriorityFeePerGas;
        
        // Recalculate total cost with EIP-1559
        estimate.totalCost = gasLimit * estimate.maxFeePerGas;
      }

      console.log('⛽ Gas estimate:', {
        gasLimit: gasLimit.toString(),
        gasPrice: `${ethers.formatUnits(gasPrice, 'gwei')} gwei`,
        totalCost: `${ethers.formatEther(totalCost)} MATIC`,
        estimatedTime: estimate.estimatedTime
      });

      return estimate;
    } catch (error) {
      console.error('❌ Gas estimation failed:', error);
      throw new Error(`Gas estimation failed: ${error}`);
    }
  }

  // Execute transaction with automatic retry and gas adjustment
  async executeWithRetry(
    signer: ethers.Signer,
    contractAddress: string,
    data: string,
    value = '0',
    speed: 'slow' | 'standard' | 'fast' | 'instant' = 'standard'
  ): Promise<ethers.TransactionResponse> {
    let currentSpeed = speed;
    let attempt = 0;

    while (attempt < this.retryConfig.maxRetries) {
      try {
        console.log(`🚀 Transaction attempt ${attempt + 1} with ${currentSpeed} speed`);

        // Get optimized gas estimate
        const gasEstimate = await this.estimateGasOptimized(
          contractAddress,
          data,
          await signer.getAddress(),
          value,
          currentSpeed
        );

        // Prepare transaction
        const tx: ethers.TransactionRequest = {
          to: contractAddress,
          data,
          value: ethers.parseEther(value),
          gasLimit: gasEstimate.gasLimit,
        };

        // Use EIP-1559 if available, otherwise use legacy
        if (gasEstimate.maxFeePerGas && gasEstimate.maxPriorityFeePerGas) {
          tx.maxFeePerGas = gasEstimate.maxFeePerGas;
          tx.maxPriorityFeePerGas = gasEstimate.maxPriorityFeePerGas;
          tx.type = 2; // EIP-1559
        } else {
          tx.gasPrice = gasEstimate.gasPrice;
          tx.type = 0; // Legacy
        }

        // Send transaction
        const txResponse = await signer.sendTransaction(tx);
        
        console.log(`✅ Transaction sent: ${txResponse.hash}`);
        return txResponse;

      } catch (error) {
        console.error(`❌ Transaction attempt ${attempt + 1} failed:`, error);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Check if it's a gas-related error
        if (this.isGasError(errorMessage) && attempt < this.retryConfig.maxRetries - 1) {
          // Increase gas speed for next attempt
          currentSpeed = this.increaseGasSpeed(currentSpeed);
          
          // Wait before retry
          await this.delay(this.retryConfig.minRetryDelay * (attempt + 1));
          
          attempt++;
          continue;
        }
        
        // If not a gas error or max retries reached, throw
        throw new Error(`Transaction failed after ${attempt + 1} attempts: ${errorMessage}`);
      }
    }

    throw new Error(`Transaction failed after ${this.retryConfig.maxRetries} attempts`);
  }

  // Wait for transaction confirmation with timeout
  async waitForConfirmation(
    txHash: string, 
    confirmations = 1, 
    timeoutMs = 300000 // 5 minutes
  ): Promise<ethers.TransactionReceipt> {
    console.log(`⏳ Waiting for ${confirmations} confirmation(s) for tx: ${txHash}`);
    
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash);
        
        if (receipt && receipt.confirmations >= confirmations) {
          console.log(`✅ Transaction confirmed: ${txHash}`);
          return receipt;
        }
        
        // Wait 2 seconds before checking again
        await this.delay(2000);
        
      } catch (error) {
        console.warn('⚠️ Error checking transaction status:', error);
        await this.delay(5000); // Wait longer on error
      }
    }
    
    throw new Error(`Transaction confirmation timeout: ${txHash}`);
  }

  // Monitor gas prices and alert on significant changes
  async monitorGasPrices(
    alertThreshold = 0.5, // Alert if gas price changes by 50%
    intervalMs = 60000 // Check every minute
  ): Promise<NodeJS.Timeout> {
    let lastGasPrice: bigint | null = null;
    
    const monitor = setInterval(async () => {
      try {
        const gasPrices = await this.getCurrentGasPrices();
        const currentGasPrice = gasPrices.standard;
        
        if (lastGasPrice) {
          const changePercent = Number(
            (currentGasPrice - lastGasPrice) * BigInt(100) / lastGasPrice
          ) / 100;
          
          if (Math.abs(changePercent) >= alertThreshold) {
            console.log(`🚨 Gas price alert: ${changePercent > 0 ? '+' : ''}${(changePercent * 100).toFixed(1)}%`);
            console.log(`Previous: ${ethers.formatUnits(lastGasPrice, 'gwei')} gwei`);
            console.log(`Current: ${ethers.formatUnits(currentGasPrice, 'gwei')} gwei`);
          }
        }
        
        lastGasPrice = currentGasPrice;
      } catch (error) {
        console.error('❌ Gas price monitoring error:', error);
      }
    }, intervalMs);
    
    console.log(`👀 Started gas price monitoring (${alertThreshold * 100}% threshold)`);
    return monitor;
  }

  // Utility methods
  private isGasError(errorMessage: string): boolean {
    const gasErrorKeywords = [
      'gas',
      'insufficient funds',
      'execution reverted',
      'replacement transaction underpriced',
      'transaction underpriced'
    ];
    
    return gasErrorKeywords.some(keyword => 
      errorMessage.toLowerCase().includes(keyword)
    );
  }

  private increaseGasSpeed(currentSpeed: string): 'slow' | 'standard' | 'fast' | 'instant' {
    const speedOrder = ['slow', 'standard', 'fast', 'instant'];
    const currentIndex = speedOrder.indexOf(currentSpeed);
    
    if (currentIndex < speedOrder.length - 1) {
      return speedOrder[currentIndex + 1] as any;
    }
    
    return 'instant'; // Max speed
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Smart contract interaction with optimized gas
export class SmartContractGasOptimizer {
  private gasOptimizer: DynamicGasOptimizer;
  
  constructor(rpcUrl: string) {
    this.gasOptimizer = new DynamicGasOptimizer(rpcUrl);
  }

  // Execute contract function with gas optimization
  async executeContract(
    contract: ethers.Contract,
    methodName: string,
    args: any[],
    signer: ethers.Signer,
    options: {
      speed?: 'slow' | 'standard' | 'fast' | 'instant';
      value?: string;
      retries?: boolean;
    } = {}
  ): Promise<ethers.TransactionResponse> {
    try {
      const { speed = 'standard', value = '0', retries = true } = options;
      
      // Encode function data
      const data = contract.interface.encodeFunctionData(methodName, args);
      const contractAddress = await contract.getAddress();
      
      if (retries) {
        // Use retry mechanism
        return await this.gasOptimizer.executeWithRetry(
          signer,
          contractAddress,
          data,
          value,
          speed
        );
      } else {
        // Single attempt with optimized gas
        const gasEstimate = await this.gasOptimizer.estimateGasOptimized(
          contractAddress,
          data,
          await signer.getAddress(),
          value,
          speed
        );

        const tx = await contract[methodName](...args, {
          gasLimit: gasEstimate.gasLimit,
          gasPrice: gasEstimate.gasPrice,
          value: ethers.parseEther(value)
        });

        return tx;
      }
    } catch (error) {
      console.error(`❌ Contract execution failed for ${methodName}:`, error);
      throw error;
    }
  }
}

export default DynamicGasOptimizer;