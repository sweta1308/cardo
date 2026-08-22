import { useState } from 'react'
import { inputClass, labelClass } from './formStyles'
import eyeIcon from '../../assets/eye.svg'
import eyeOffIcon from '../../assets/eye-off.svg'

interface PasswordInputProps {
  id: string
  label: string
  placeholder: string
  autoComplete: string
}

const PasswordInput = ({ id, label, placeholder, autoComplete }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`${inputClass} pr-10`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex items-center px-3 opacity-70 hover:opacity-100"
        >
          <img src={visible ? eyeOffIcon : eyeIcon} alt="Eye" className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default PasswordInput
