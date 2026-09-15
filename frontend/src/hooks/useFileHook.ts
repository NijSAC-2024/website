import {apiFetch} from '../api.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {ApiError} from '../error/error.ts';
import {FileMetadata} from '../types.ts';
import {queryKeys} from '../queries.ts';
import {useAuth} from '../providers/AuthProvider.tsx';
import {inCommittee} from '../util.ts';
import {useUserHook} from './useUserHook.ts';

export function useFileHook() {
  const {text} = useLanguage();
  const queryClient = useQueryClient();
  const {user} = useAuth();
  const {useUserCommittees} = useUserHook()
  const myCommittees = useUserCommittees(user?.id);

  function useFiles(limit: number, offset: number) {
    const {data} = useQuery<FileMetadata[], ApiError>({
      queryKey: queryKeys.files.list(limit, offset),
      enabled: inCommittee(myCommittees),
      queryFn: () => apiFetch<FileMetadata[]>(
        `/file?limit=${limit}&offset=${offset}`
      ),
      placeholderData: (prev) => prev,
      staleTime: 60_000,
    });

    return data;
  }

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
    isPublic = false
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
      isPublic = false,
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.lists(),
      });
      enqueueSnackbar(
        text('Files uploaded', 'Bestanden geüpload'),
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

  const uploadFiles = (
    files: File[],
    isPublic = true
  ) =>
    uploadFilesMutation.mutateAsync({
      files,
      isPublic,
    });

  const deleteFileMutation = useMutation<
    void,
    ApiError,
    { fileId: string }
  >({
    mutationFn: async ({fileId}) => {
      await apiFetch<void>(
        `/file/${fileId}`,
        {
          method: 'DELETE',
        }
      );
    },

    onSuccess: (_, {fileId}) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.files.lists(),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.files.detail(fileId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.files.metadata(fileId),
      });

      enqueueSnackbar(text('File deleted', 'Bestand verwijderd'), {
        variant: 'success',
      });
    },

    onError: (error: ApiError) =>
      enqueueSnackbar(`${error.message}: ${error.reference}`, {
        variant: 'error',
      }),
  });

  const deleteFile = (fileId: string) =>
    deleteFileMutation.mutateAsync({fileId});


  return {
    useFiles,
    uploadFile,
    uploadFiles,
    deleteFile,
    uploading: uploadFileMutation.isPending || uploadFilesMutation.isPending,
  };
}