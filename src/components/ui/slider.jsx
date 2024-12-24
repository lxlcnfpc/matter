import React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

const Slider = React.forwardRef(({ 
  className,
  defaultValue,
  max = 100,
  min = 0,
  step = 1,
  onValueChange,
  ...props 
}, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className="relative flex w-full touch-none select-none items-center"
    defaultValue={defaultValue}
    max={max}
    min={min}
    step={step}
    onValueChange={onValueChange}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-gray-200">
      <SliderPrimitive.Range className="absolute h-full rounded-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className="block h-4 w-4 rounded-full border border-primary bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
    />
  </SliderPrimitive.Root>
))
Slider.displayName = "Slider"

export { Slider }
