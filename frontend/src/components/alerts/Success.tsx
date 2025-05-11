import { forwardRef, useCallback } from 'react';
import { useSnackbar, SnackbarContent, CustomContentProps } from 'notistack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Success = forwardRef<HTMLDivElement, CustomContentProps>(
  ({ id, message, variant }, ref) => {
    const { closeSnackbar } = useSnackbar();

    const handleDismiss = useCallback(() => {
      closeSnackbar(id);
    }, [id, closeSnackbar]);

    return (
      <SnackbarContent
        ref={ref}
        className="p-4 bg-green-600 rounded-2xl text-white"
      >
        <div className="flex justify-center w-full">
          <CheckCircleIcon />
          <div className="w-full ml-3">
            <div className="flex justify-between w-full">
              <div>
                <b>{variant.charAt(0).toUpperCase() + variant.slice(1)}</b>
              </div>
              <IconButton size="small" onClick={handleDismiss}>
                <CloseIcon className="text-white" fontSize="small" />
              </IconButton>
            </div>
            <p className="mt-[-5px]">{message}</p>
          </div>
        </div>
      </SnackbarContent>
    );
  },
);

Success.displayName = 'Success';

export default Success;
