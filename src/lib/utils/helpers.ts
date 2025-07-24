import { cardState, favouriteListRefresh } from "$lib/store/GlobalState"
import { get } from "svelte/store"
import fallbackImage from "../../public/images/404.jpg"


export const handleNoImageError = (event: Event): void => {

    const img = event.target as HTMLImageElement

    if (img.src !== fallbackImage) {
        img.src = fallbackImage
    }

}

export const fetchTrailer = async (id: number) => {
    try {
        const response = await fetch(`/api/trailer/${id}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        })

        const data = await response.json()

        // console.log(data);



        if (data.trailer && data.trailer.key) {
            return data.trailer.key
        } else {
            console.log("no trailer found");

        }
    } catch (error) {
        console.log(error);

    }
}
export const addedToFavoriteList = (movie: Movie) => {
    let list = localStorage.getItem('list')
    let movieList: Movie[] = []
    if (list) {
        try {
            movieList = JSON.parse(list)
            const exists = movieList?.some((m) => m.id === movie.id)
            if (exists) {
                movieList = movieList.filter((m) => {
                    return m.id !== movie.id
                })
                localStorage.setItem('list', JSON.stringify(movieList))
                cardState.update((state) => ({
                    ...state,
                    isHovered: false,
                    item: null,
                    position: { x: -500, y: 0 },
                    cardId:null
                }))
                favouriteListRefresh.set(!get(favouriteListRefresh))
                return
            }
        }
        catch (error) {
            localStorage.removeItem('list')
            movieList = []
        }
    }
    movieList.push(movie)
    try {
        localStorage.setItem('list', JSON.stringify(movieList))
    } catch (error) {
        console.log("error saving the movie");
    }
}

export const convertMinsToHrs = (runtime: number) => {

    const hrs = Math.floor(runtime / 60)
    const mins = runtime % 60

    return hrs === 0 ? `${mins}m` : `${hrs}h ${mins}m`

}