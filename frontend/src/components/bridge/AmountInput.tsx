import React from 'react'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  maxAmount: string
  token: string
  onMaxClick: () => void
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  maxAmount,
  token,
  onMaxClick
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow empty string
    if (inputValue === '') {
      onChange('')
      return
    }
    
    // Allow only numbers and decimal point
    if (!/^\d*\.?\d*$/.test(inputValue)) {
      return
    }
    
    // Prevent multiple decimal points
    if ((inputValue.match(/\./g) || []).length > 1) {
      return
    }
    
    onChange(inputValue)
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (isNaN(num)) return '0'
    return num.toFixed(4)
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-2 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder="0.0"
          className="flex-1 bg-transparent text-2xl font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
        />
        
        <div className="flex items-center space-x-2">
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {token}
          </span>
          
          <button
            onClick={onMaxClick}
            className="px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/30 rounded-md transition-colors"
          >
            MAX
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 px-1">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Available: {formatBalance(maxAmount)} {token}
        </div>
        
        {value && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ≈ ${(parseFloat(value) * 1.25).toFixed(2)} USD
          </div>
        )}
      </div>
    </div>
  )
}

export default AmountInput