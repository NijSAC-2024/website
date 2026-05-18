import {apiFetch} from '../api.ts';
import {Page, PageContent} from '../types.ts';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {queryKeys} from '../queries.ts';
import {ApiError} from '../error/error.ts';
import {enqueueSnackbar} from 'notistack';
import {useLanguage} from '../providers/LanguageProvider.tsx';

export function usePageHook() {
  const queryClient = useQueryClient();
  const {text} = useLanguage();

  function usePages() {
    const {data} = useQuery<Page[]>({
      queryKey: queryKeys.pages.all(),
      queryFn: () => apiFetch<Page[]>('/page'),
      staleTime: 60_000,
    });
    return data;
  }

  function usePage(slug?: string) {
    const {data} = useQuery<Page>({
      queryKey: queryKeys.pages.detail(slug),
      enabled: !!slug,
      queryFn: () => apiFetch<Page>(`/page/${slug}`),
      staleTime: 60_000,
    });
    return data;
  }

  const createPageMutation = useMutation<Page, ApiError, PageContent>({
    mutationFn: (content) =>
      apiFetch<Page>('/page', {method: 'POST', body: JSON.stringify(content)}),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: queryKeys.pages.all()});
      enqueueSnackbar(text('Page created', 'Pagina aangemaakt'), {variant: 'success'});
    },
  });

  const updatePageMutation = useMutation<Page, ApiError, {pageId: string; content: PageContent}>({
    mutationFn: ({pageId, content}) =>
      apiFetch<Page>(`/page/id/${pageId}`, {method: 'PUT', body: JSON.stringify(content)}),
    onSuccess: (_, {content}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.pages.all()});
      queryClient.invalidateQueries({queryKey: queryKeys.pages.detail(content.slug)});
      enqueueSnackbar(text('Page updated', 'Pagina bijgewerkt'), {variant: 'success'});
    },
  });

  const deletePageMutation = useMutation<void, ApiError, {pageId: string; slug: string}>({
    mutationFn: ({pageId}) => apiFetch<void>(`/page/id/${pageId}`, {method: 'DELETE'}),
    onSuccess: (_, {slug}) => {
      queryClient.invalidateQueries({queryKey: queryKeys.pages.all()});
      queryClient.removeQueries({queryKey: queryKeys.pages.detail(slug)});
      enqueueSnackbar(text('Page deleted', 'Pagina verwijderd'), {variant: 'success'});
    },
  });

  return {
    usePages,
    usePage,
    createPage: (content: PageContent) => createPageMutation.mutateAsync(content),
    updatePage: (pageId: string, content: PageContent) => updatePageMutation.mutateAsync({pageId, content}),
    deletePage: (pageId: string, slug: string) => deletePageMutation.mutateAsync({pageId, slug}),
  };
}
