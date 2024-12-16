import { forwardRef, useCallback } from 'react';
import { useSnackbar, SnackbarContent, CustomContentProps } from 'notistack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const Warning = forwardRef<HTMLDivElement, CustomContentProps>(({ id, message, variant }, ref) => {
  const { closeSnackbar } = useSnackbar();

  const handleDismiss = useCallback(() => {
    closeSnackbar(id);
  }, [id, closeSnackbar]);

  return (
    <SnackbarContent ref={ref} className="p-4 bg-orange-600 rounded text-white">
      <div className="flex justify-center w-full">
        <WarningAmberIcon />
        <div className="w-full ml-3">
          <div className="flex justify-between w-full">
            <b>{variant.charAt(0).toUpperCase() + variant.slice(1)}</b>
            <IconButton size="small" onClick={handleDismiss}>
              <CloseIcon className="text-white" fontSize="small" />
            </IconButton>
          </div>
          <p className="mt-[-5px]">{message}</p>
        </div>
      </div>
    </SnackbarContent>
  );
});

Warning.displayName = 'Warning';

export default Warning;