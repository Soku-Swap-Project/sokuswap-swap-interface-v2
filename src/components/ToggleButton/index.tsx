// import { RadioGroup as HeadlessRadioGroup } from '@headlessui/react'
import { ButtonProps } from 'app/components/Button'
import { ComponentProps, FC } from 'react'

const FILLED = {
  group: 'border border-light-800 rounded p-0.5 bg-dark-900',
  option: {
    // @ts-ignore TYPE NEEDS FIXING
    checked: (checked) => (checked ? 'border-transparent border-gradient-r-blue-pink-dark-900' : 'border-transparent'),
    default: 'py-1 rounded-lg border',
  },
}

const OUTLINED = {
  group: 'gap-2',
  option: {
    // @ts-ignore TYPE NEEDS FIXING
    checked: (checked) => (checked ? 'border-dark-700 bg-gradient-to-r from-blue to-pink' : 'border-dark-700'),
    default: 'py-3 rounded border',
  },
}

const VARIANTS = {
  filled: FILLED,
  outlined: OUTLINED,
}

type Props = ComponentProps<any> & Omit<ButtonProps, 'onChange'>
type ToggleButtonGroup<P> = FC<P> & {
  Button: FC<ComponentProps<any>>
}

// const ToggleButtonGroup = ({ children, size = '', className = '', variant = 'filled', ...props }) => {
//   return (
//     <div
//       {...props}
//       // @ts-ignore TYPE NEEDS FIXING
//       className={classNames(className, `flex bg-dark-1000/40 rounded-full`, VARIANTS[variant].group)}
//     >
//       {Children.map(children, (child) => {
//         if (isValidElement(child)) {
//           return cloneElement(child, {})
//         }

//         return child
//       })}
//     </div>
//   )
// }

// type ToggleButtonProps = ComponentProps<any>
// ToggleButtonGroup.Button = ({ value, children, size, style, className }: ToggleButtonProps) => {
//   return (
//     <HeadlessRadioGroup.Option value={value} as={Fragment}>
//       {({ checked }) => (
//         <Button
//           style={style}
//           size={size}
//           id={`radio-option-${value}`}
//           variant={checked ? 'filled' : 'empty'}
//           color={checked ? 'blue' : 'gray'}
//           className={className}
//           type="button"
//         >
//           {children}
//         </Button>
//       )}
//     </HeadlessRadioGroup.Option>
//   )
// }

export default ToggleButtonGroup
