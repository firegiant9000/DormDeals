import React from 'react'
import { useShop } from '../context/ShopContext'
import LoginPopup from './LoginPopup'

const LoginPopupWrapper: React.FC = () => {
  const { showLoginPopup, loginPopupAction, closeLoginPopup } = useShop()

  console.log('LoginPopupWrapper - showLoginPopup:', showLoginPopup, 'loginPopupAction:', loginPopupAction)

  if (!showLoginPopup || !loginPopupAction) {
    return null
  }

  return (
    <LoginPopup
      isOpen={showLoginPopup}
      onClose={closeLoginPopup}
      action={loginPopupAction}
    />
  )
}

export default LoginPopupWrapper
