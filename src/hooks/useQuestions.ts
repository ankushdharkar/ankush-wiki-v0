import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { questionsApi } from '../services/api'
import type { Question } from '../services/api'

const PAGE_SIZE = 10

export function useQuestions(params: { topic?: string; sort: string }, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['questions', { topic: params.topic, sort: params.sort }],
    queryFn: ({ pageParam = 0 }) =>
      questionsApi.getAll({
        topic: params.topic,
        sort: params.sort as 'upvotes' | 'recent' | 'trending',
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.flat().length : undefined,
    enabled,
  })
}

export function useTopics(enabled: boolean) {
  return useQuery({
    queryKey: ['topics'],
    queryFn: () => questionsApi.getTopics(),
    enabled,
  })
}

export function useCreateQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: questionsApi.create,
    onSuccess: (newQuestion) => {
      queryClient.setQueriesData<{ pages: Question[][]; pageParams: number[] }>(
        { queryKey: ['questions'] },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: [[newQuestion, ...old.pages[0]], ...old.pages.slice(1)],
          }
        },
      )
      queryClient.invalidateQueries({ queryKey: ['topics'] })
    },
  })
}

export function useUpvoteQuestion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ questionId, visitorId }: { questionId: number; visitorId: string }) =>
      questionsApi.upvote(questionId, visitorId),
    onSuccess: (updated) => {
      const cache = queryClient.getQueriesData<{ pages: Question[][]; pageParams: number[] }>({
        queryKey: ['questions'],
      })
      for (const [queryKey, old] of cache) {
        if (!old) continue
        const params = queryKey[1] as { sort?: string } | undefined
        const all = old.pages
          .flat()
          .map((q) => (q.id === updated.id ? updated : q))
        // Re-sort only when sorted by upvotes so layout animation triggers
        if (params?.sort === 'upvotes') {
          all.sort((a, b) => b.upvotes - a.upvotes)
        }
        // Re-chunk into pages preserving original page sizes
        const pages: Question[][] = []
        let offset = 0
        for (const page of old.pages) {
          pages.push(all.slice(offset, offset + page.length))
          offset += page.length
        }
        queryClient.setQueryData(queryKey, { ...old, pages })
      }
    },
  })
}
