'use client'

import { Select as SelectPrimitive } from '@base-ui/react/select'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-1 p-1.5', className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('flex min-w-0 flex-1 text-left', className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: 'sm' | 'default' | 'lg'
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        'group relative flex w-fit min-w-0 max-w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-input/90 bg-background text-sm font-medium text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-[color,box-shadow,border-color,background-color] duration-200 ease-out select-none',
        'hover:border-input hover:bg-accent/40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.06)]',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/25 dark:aria-invalid:ring-destructive/35',
        "data-placeholder:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'dark:border-input/60 dark:bg-input/25 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_1px_2px_rgba(0,0,0,0.2)] dark:hover:border-input dark:hover:bg-input/45',
        'aria-[expanded=true]:border-ring/60 aria-[expanded=true]:bg-accent/30 aria-[expanded=true]:shadow-md dark:aria-[expanded=true]:bg-input/55',
        'data-[size=sm]:h-8 data-[size=sm]:min-h-8 data-[size=sm]:rounded-md data-[size=sm]:px-2.5 data-[size=sm]:py-1.5 data-[size=sm]:text-[13px]',
        'data-[size=default]:h-9 data-[size=default]:min-h-9 data-[size=default]:px-3 data-[size=default]:py-2',
        'data-[size=lg]:h-11 data-[size=lg]:min-h-11 data-[size=lg]:px-3.5 data-[size=lg]:py-2.5 data-[size=lg]:text-[15px]',
        '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 *:data-[slot=select-value]:text-left',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <span className="pointer-events-none flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-[color,transform] duration-200 ease-out group-hover:text-foreground group-aria-[expanded=true]:rotate-180 group-aria-[expanded=true]:text-foreground">
            <ChevronDownIcon className="size-4 opacity-90" aria-hidden />
          </span>
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 6,
  align = 'center',
  alignOffset = 50,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50 bg-white rounded-lg"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            'relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-border/60 bg-popover/95 p-1 text-popover-foreground shadow-[0_10px_38px_-10px_rgba(0,0,0,0.28),0_4px_16px_-4px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] backdrop-blur-sm duration-150 ease-out dark:border-border/50 dark:bg-popover dark:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.06)]',
            'data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[98] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[98]',
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="gap-0.5 p-0.5 outline-none">
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        'px-2.5 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'relative flex min-h-9 w-full cursor-default items-center gap-2 rounded-lg py-2 pr-9 pl-2.5 text-sm outline-none select-none transition-[background-color,color] duration-150 ease-out',
        'text-foreground/95 hover:bg-accent/80 focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-45',
        "not-data-[variant=destructive]:focus:**:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        '*:[span]:last:flex *:[span]:last:min-w-0 *:[span]:last:flex-1 *:[span]:last:items-center *:[span]:last:gap-2 *:[span]:last:whitespace-normal *:[span]:last:break-words hover:bg-slate-500/30',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex min-w-0 flex-1 items-center gap-2">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-5 items-center justify-center rounded-full bg-primary/12 text-primary dark:bg-primary/20 dark:text-primary-foreground" />
        }
      >
        <CheckIcon className="size-3.5 stroke-[2.5]" aria-hidden />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        'pointer-events-none -mx-0.5 my-1.5 h-px bg-gradient-to-r from-transparent via-border to-transparent',
        className,
      )}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "sticky top-0 z-10 flex w-full cursor-default items-center justify-center border-b border-border/40 bg-gradient-to-b from-popover via-popover to-transparent py-1.5 text-muted-foreground transition-colors hover:text-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon aria-hidden />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "sticky bottom-0 z-10 flex w-full cursor-default items-center justify-center border-t border-border/40 bg-gradient-to-t from-popover via-popover to-transparent py-1.5 text-muted-foreground transition-colors hover:text-foreground [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon aria-hidden />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
