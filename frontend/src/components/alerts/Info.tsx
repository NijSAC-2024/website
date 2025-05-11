import { forwardRef, useCallback } from 'react';
import { useSnackbar, SnackbarContent, CustomContentProps } from 'notistack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';

const Info = forwardRef<HTMLDivElement, CustomContentProps>(
  ({ id, message, variant }, ref) => {
    const { closeSnackbar } = useSnackbar();

    const handleDismiss = useCallback(() => {
      closeSnackbar(id);
    }, [id, closeSnackbar]);

    return (
      <SnackbarContent
        ref={ref}
        className="p-4 bg-blue-600 rounded-2xl text-white"
      >
        <div className="flex justify-center w-full">
          <InfoIcon />
          <div className="ml-3 w-full">
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
  },
);

Info.displayName = 'Warning';

export default Info;
