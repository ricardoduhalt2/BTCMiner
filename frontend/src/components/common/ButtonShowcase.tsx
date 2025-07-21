import React, { useState } from 'react'
import AnimatedButton, { 
  PrimaryButton, 
  SecondaryButton, 
  GhostButton, 
  DangerButton, 
  SuccessButton, 
  WarningButton,
  FloatingActionButton 
} from './AnimatedButton'
import AnimatedContainer from './AnimatedContainer'
import AnimatedList from './AnimatedList'

const ButtonShowcase: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null)

  const handleLoadingDemo = (buttonId: string) => {
    setLoading(buttonId)
    setTimeout(() => setLoading(null), 3000)
  }

  return (
    <div className="space-y-12 p-8">
      <AnimatedContainer animation="slideDown">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent text-center mb-4">
          🎨 Button Showcase
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
          Discover our collection of animated buttons with micro-interactions
        </p>
      </AnimatedContainer>

      {/* Button Variants */}
      <AnimatedContainer animation="slideUp" delay={0.2}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Button Variants
        </h2>
        <AnimatedList 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          staggerDelay={0.1}
          animation="bounceIn"
        >
          <PrimaryButton size="md" animation="glow">
            Primary
          </PrimaryButton>
          <SecondaryButton size="md" animation="pulse">
            Secondary
          </SecondaryButton>
          <GhostButton size="md" animation="bounce">
            Ghost
          </GhostButton>
          <SuccessButton size="md" animation="ripple">
            Success
          </SuccessButton>
          <WarningButton size="md" animation="shake">
            Warning
          </WarningButton>
          <DangerButton size="md" animation="rotate">
            Danger
          </DangerButton>
        </AnimatedList>
      </AnimatedContainer>

      {/* Button Sizes */}
      <AnimatedContainer animation="slideUp" delay={0.3}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Button Sizes
        </h2>
        <AnimatedList 
          className="flex flex-wrap items-center gap-4"
          staggerDelay={0.1}
          animation="slideRight"
        >
          <PrimaryButton size="sm" animation="glow">
            Small
          </PrimaryButton>
          <PrimaryButton size="md" animation="glow">
            Medium
          </PrimaryButton>
          <PrimaryButton size="lg" animation="glow">
            Large
          </PrimaryButton>
          <PrimaryButton size="xl" animation="glow">
            Extra Large
          </PrimaryButton>
        </AnimatedList>
      </AnimatedContainer>

      {/* Animation Types */}
      <AnimatedContainer animation="slideUp" delay={0.4}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Animation Types
        </h2>
        <AnimatedList 
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          staggerDelay={0.1}
          animation="scaleIn"
        >
          <PrimaryButton animation="ripple" className="h-16">
            Ripple Effect
          </PrimaryButton>
          <PrimaryButton animation="pulse" className="h-16">
            Pulse Animation
          </PrimaryButton>
          <PrimaryButton animation="bounce" className="h-16">
            Bounce Effect
          </PrimaryButton>
          <PrimaryButton animation="glow" className="h-16">
            Glow Effect
          </PrimaryButton>
          <PrimaryButton animation="shake" className="h-16">
            Shake Animation
          </PrimaryButton>
          <PrimaryButton animation="rotate" className="h-16">
            Rotate Effect
          </PrimaryButton>
        </AnimatedList>
      </AnimatedContainer>

      {/* Gradient Buttons */}
      <AnimatedContainer animation="slideUp" delay={0.5}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Gradient Buttons
        </h2>
        <AnimatedList 
          className="flex flex-wrap gap-4"
          staggerDelay={0.1}
          animation="rotateIn"
        >
          <PrimaryButton gradient animation="glow" size="lg">
            Primary Gradient
          </PrimaryButton>
          <SuccessButton gradient animation="pulse" size="lg">
            Success Gradient
          </SuccessButton>
          <DangerButton gradient animation="bounce" size="lg">
            Danger Gradient
          </DangerButton>
          <WarningButton gradient animation="shake" size="lg">
            Warning Gradient
          </WarningButton>
        </AnimatedList>
      </AnimatedContainer>

      {/* Buttons with Icons */}
      <AnimatedContainer animation="slideUp" delay={0.6}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Buttons with Icons
        </h2>
        <AnimatedList 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          staggerDelay={0.1}
          animation="slideLeft"
        >
          <PrimaryButton 
            icon="🚀" 
            animation="glow"
            size="lg"
          >
            Launch
          </PrimaryButton>
          <SuccessButton 
            icon="✅" 
            iconPosition="right"
            animation="bounce"
            size="lg"
          >
            Complete
          </SuccessButton>
          <DangerButton 
            icon="🗑️" 
            animation="shake"
            size="lg"
          >
            Delete
          </DangerButton>
          <SecondaryButton 
            icon="⚙️" 
            animation="rotate"
            size="lg"
          >
            Settings
          </SecondaryButton>
        </AnimatedList>
      </AnimatedContainer>

      {/* Loading States */}
      <AnimatedContainer animation="slideUp" delay={0.7}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Loading States
        </h2>
        <AnimatedList 
          className="flex flex-wrap gap-4"
          staggerDelay={0.1}
          animation="fadeIn"
        >
          <PrimaryButton 
            loading={loading === 'primary'}
            onClick={() => handleLoadingDemo('primary')}
            animation="glow"
            size="lg"
          >
            {loading === 'primary' ? 'Loading...' : 'Click to Load'}
          </PrimaryButton>
          <SuccessButton 
            loading={loading === 'success'}
            onClick={() => handleLoadingDemo('success')}
            animation="pulse"
            size="lg"
          >
            {loading === 'success' ? 'Processing...' : 'Process Data'}
          </SuccessButton>
          <DangerButton 
            loading={loading === 'danger'}
            onClick={() => handleLoadingDemo('danger')}
            animation="shake"
            size="lg"
          >
            {loading === 'danger' ? 'Deleting...' : 'Delete Item'}
          </DangerButton>
        </AnimatedList>
      </AnimatedContainer>

      {/* Full Width Buttons */}
      <AnimatedContainer animation="slideUp" delay={0.8}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Full Width Buttons
        </h2>
        <div className="space-y-4 max-w-md mx-auto">
          <PrimaryButton 
            fullWidth 
            gradient 
            animation="glow" 
            size="lg"
            icon="💎"
          >
            Full Width Primary
          </PrimaryButton>
          <SecondaryButton 
            fullWidth 
            animation="bounce" 
            size="lg"
            icon="📊"
          >
            Full Width Secondary
          </SecondaryButton>
          <GhostButton 
            fullWidth 
            animation="pulse" 
            size="lg"
            icon="👻"
          >
            Full Width Ghost
          </GhostButton>
        </div>
      </AnimatedContainer>

      {/* Interactive Demo */}
      <AnimatedContainer animation="scaleIn" delay={0.9}>
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            🎮 Interactive Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try clicking these buttons to see the animations in action!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Hover Effects
              </h3>
              <div className="space-y-3">
                <PrimaryButton fullWidth animation="glow" gradient>
                  Hover for Glow ✨
                </PrimaryButton>
                <SuccessButton fullWidth animation="bounce">
                  Hover to Bounce 🎾
                </SuccessButton>
                <DangerButton fullWidth animation="shake">
                  Hover to Shake 🌪️
                </DangerButton>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Click Effects
              </h3>
              <div className="space-y-3">
                <PrimaryButton fullWidth animation="ripple">
                  Click for Ripple 🌊
                </PrimaryButton>
                <WarningButton fullWidth animation="rotate">
                  Click to Rotate 🔄
                </WarningButton>
                <SecondaryButton fullWidth animation="pulse">
                  Click to Pulse 💓
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>
      </AnimatedContainer>

      {/* Floating Action Button Demo */}
      <FloatingActionButton>
        ➕
      </FloatingActionButton>
    </div>
  )
}

export default ButtonShowcase