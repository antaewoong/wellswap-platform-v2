'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { WELLSWAP_CONTRACT_ADDRESS, WELLSWAP_ABI } from '@/lib/contracts/wellswap-abi'

export function useContract() {
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const initializeContract = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()
          const contract = new ethers.Contract(WELLSWAP_CONTRACT_ADDRESS, WELLSWAP_ABI, signer)
          
          setProvider(provider)
          setSigner(signer)
          setContract(contract)
          setIsConnected(true)
        } catch (error) {
          console.error('Failed to initialize contract:', error)
        }
      }
    }

    initializeContract()
  }, [])

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(WELLSWAP_CONTRACT_ADDRESS, WELLSWAP_ABI, signer)
        
        setProvider(provider)
        setSigner(signer)
        setContract(contract)
        setIsConnected(true)
        
        return await signer.getAddress()
      } catch (error) {
        console.error('Failed to connect wallet:', error)
        throw error
      }
    }
    throw new Error('MetaMask not installed')
  }

  const registerAsset = async (company: string, product: string, premiumPaid: string, currentValue: string, ipfsHash: string) => {
    if (!contract) throw new Error('Contract not initialized')
    
    try {
      const [sellerFee] = await contract.getRegistrationFeesBNB()
      const tx = await contract.registerInsuranceAsset(
        company,
        product,
        ethers.parseEther(premiumPaid),
        ethers.parseEther(currentValue),
        ipfsHash,
        { value: sellerFee }
      )
      return await tx.wait()
    } catch (error) {
      console.error('Failed to register asset:', error)
      throw error
    }
  }

  const getAssetInfo = async (assetId: number) => {
    if (!contract) throw new Error('Contract not initialized')
    return await contract.getAssetInfo(assetId)
  }

  const getRegistrationFees = async () => {
    if (!contract) throw new Error('Contract not initialized')
    return await contract.getRegistrationFeesBNB()
  }

  return {
    contract,
    signer,
    provider,
    isConnected,
    connectWallet,
    registerAsset,
    getAssetInfo,
    getRegistrationFees
  }
}
