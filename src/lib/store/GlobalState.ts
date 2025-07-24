import { writable } from "svelte/store";

export const selectedMovie = writable<MovieDetails>()

export const popularMovies = writable<Movie[]>([])
export const trendingMovies = writable<Movie[]>([])
export const topRatedMovies = writable<Movie[]>([])
export const moviesWithGenre = writable<Movie[]>([])

export const cardState = writable<CardState>({
    isHovered: false,
    cardId: null,
    position: { x: -1000, y: 0 },
    dimensions: { width: 0, height: 0 },
    item: null
})
export const favouriteListRefresh = writable<boolean>(false)

const initialModalState: ModalState = {
    isOpen: false,
    videoId: "",
    movieId: "",
    movieData: null,
    loading: false,
    error: null
}

export const modalStore = writable<ModalState>(initialModalState)

const movieCache: { [key: string]: MovieDetails } = {}

export const openModal = async (videoId: string, movieId: string) => {
    if (movieCache[movieId]) {
        console.log('执行到了1');
        
        modalStore.set({
            isOpen: true,
            videoId,
            movieId,
            movieData: movieCache[movieId],
            loading: false,
            error: null
        })
        return
    }
    console.log('执行到了2');
    modalStore.set({
        isOpen: true,
        videoId,
        movieId,
        movieData: null,
        loading: false,
        error: null
    })
    cardState.update((state: any) => {
        return { ...state, isHovered: false, item: null, position: { x: -1000, y: 0 } }
    })
    try {
        const response = await fetch(`/api/movie/${movieId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (!response.ok) {
            const errData = await response.json()
            throw new Error(errData.error || "Failed to fetch the movie data...")
        }
        const data = await response.json()
        const movieData: MovieDetails = data.movieDetails
        if (movieData) {
            movieCache[movieId] = movieData
        }
        modalStore.update((state) => ({
            ...state,
            movieData,
            loading: false,
            error: null
        }))
    } catch (error) {
        modalStore.update((state) => ({
            ...state,
            movieData: null,
            loading: false,
            error: "Failed to fetch the movie data..."
        }))
    }
}



export const closeModal = () => {
    modalStore.set(initialModalState)
}