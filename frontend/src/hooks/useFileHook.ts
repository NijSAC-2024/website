import {apiFetch} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useMutation} from '@tanstack/react-query';
import {ApiError} from '../error/error.ts';
import {FileMetadata} from '../types.ts';

export function useFileHook() {
  const {text} = useLanguage();

  const uploadFileMutation = useMutation<FileMetadata[],
    ApiError,
    {
      file: File;
      isPublic?: boolean;
    }
  >({
    mutationFn: async ({file, isPublic = true}) => {
      const formData = new FormData();

      formData.append('isPublic', String(isPublic));
      formData.append(file.name, file);

      return await apiFetch<FileMetadata[]>('/file', {
        method: 'POST',
        body: formData,
        headers: {},
      });
    },

    onSuccess: () => {
      enqueueSnackbar(
        text('File uploaded', 'Bestand geüpload'),
        {variant: 'success'}
      );
    },

    onError: (error: ApiError) => {
      enqueueSnackbar(
        `${error.message}: ${error.reference}`,
        {variant: 'error'}
      );
    },
  });

  const uploadFile = (
    file: File,
    isPublic = true
  ) => uploadFileMutation.mutateAsync({file, isPublic});

  const uploadFilesMutation = useMutation<
    FileMetadata[],
    ApiError,
    {
      files: File[];
      isPublic?: boolean;
    }
  >({
    mutationFn: async ({
      files,
      isPublic = true,
    }) => {
      const formData = new FormData();

      formData.append(
        'isPublic',
        String(isPublic)
      );

      files.forEach((file) => {
        formData.append(file.name, file);
      });

      return await apiFetch<FileMetadata[]>(
        '/file',
        {
          method: 'POST',
          body: formData,
          headers: {},
        }
      );
    },
  });

  const uploadFiles = (
    files: File[],
    isPublic = true
  ) =>
    uploadFilesMutation.mutateAsync({
      files,
      isPublic,
    });

  return {
    uploadFile,
    uploadFiles,
    uploading: uploadFileMutation.isPending || uploadFilesMutation.isPending,
  };
}