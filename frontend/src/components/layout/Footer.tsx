import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/logoBTCMINER.png" 
                alt="BTCMiner Logo" 
                className="w-6 h-6 rounded-md"
              />
              <span className="text-sm font-medium bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">BTCMiner</span>
            </div>
            <span className="text-sm text-gray-400">
              © 2024 BTCMiner. All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link
              to="/privacy"
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/support"
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer