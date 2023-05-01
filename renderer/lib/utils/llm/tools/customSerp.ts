import { DynamicTool } from 'langchain/tools'

export const customSerp = new DynamicTool({
  name: 'search',
  description:
    'a search engine. useful for when you need to answer questions about current events. input should be a search query.',
  func: async (input: string) => {
    console.log('👉 ~ input:', input)
    const response = await fetch('/api/serp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: input })
    })

    const res = await response.json()
    console.log('👉 ~ res:', res)
    if (res.error) {
      return `Got error from serpAPI: ${res.error}`
    }

    if (res.answer_box?.answer) {
      return res.answer_box.answer
    }

    if (res.answer_box?.snippet) {
      return res.answer_box.snippet
    }

    if (res.answer_box?.snippet_highlighted_words) {
      return res.answer_box.snippet_highlighted_words[0]
    }

    if (res.sports_results?.game_spotlight) {
      return res.sports_results.game_spotlight
    }

    if (res.knowledge_graph?.description) {
      return res.knowledge_graph.description
    }

    if (res.organic_results?.[0]?.snippet) {
      return res.organic_results[0].snippet
    }

    return 'No good search result found'
  }
})
