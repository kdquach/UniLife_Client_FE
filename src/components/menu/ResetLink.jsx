import clsx from "clsx";

function ResetLink({ onClick, disabled }) {
   return (
      <button
         type="button"
         onClick={onClick}
         disabled={disabled}
         className={clsx(
            'relative text-sm font-medium transition-colors duration-200 group',
            disabled
               ? 'cursor-not-allowed text-slate-300'
               : 'text-muted hover:text-primary'
         )}
      >
         Reset filters

         {/* underline animation */}
         {!disabled && (
            <span
               className="
            pointer-events-none
            absolute left-0 -bottom-0.5 h-[1.5px] w-full
            origin-left scale-x-0 bg-primary
            transition-transform duration-300 ease-out
            group-hover:scale-x-100
          "
            />
         )}
      </button>
   );
}

export default ResetLink;