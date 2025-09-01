import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET() {
  try {
    // Test Polygon RPC connection
    const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Simple blockchain query - get latest block number
    const blockNumber = await provider.getBlockNumber();
    
    return NextResponse.json({
      status: 'healthy',
      blockchain: 'connected',
      network: 'polygon',
      latestBlock: blockNumber,
      rpcUrl: rpcUrl.split('//')[1]?.split('/')[0], // Hide full URL for security
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        blockchain: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown blockchain error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}