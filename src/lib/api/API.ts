import { BASE_URL, tmdbFetch } from "./ApiWrapper"
/*
真正的网络请求方法也不在这里,而是在 *.server.ts中
这里主要封装 api路径\ 提交的的参数

*/

const handleFetchResponse = async(response:Response)=>{
    if(!response.ok){
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, data: ${JSON.stringify(errorData)}`)
    }
    return response.json()
}
export const fetchPopularMovies = async(fetchFn:typeof fetch) :Promise<Movie[]>=>{
    const data = await tmdbFetch<TMDBRespones<{id:number,title:string,backdrop_path:string}>>('movie/popular',{},fetchFn)

    return data?.results || []
    
}

export const fetchTrendingMovies = async(fetchFn:typeof fetch) :Promise<Movie[]> =>{
    const data = await tmdbFetch<TMDBRespones<{id:number,title:string,backdrop_path:string}>>('trending/movie/week',{},fetchFn)

    return data?.results || []
    
}


export const fetchTopRatedMovies = async(fetchFn:typeof fetch) : Promise<Movie[]> =>{
    const data = await tmdbFetch<TMDBRespones<{id:number,title:string,backdrop_path:string}>>('movie/top_rated',{},fetchFn)

    return data?.results || []
    
}


export const getGenres = async(fetchFn:typeof fetch):Promise<Genre[] | null> =>{
    const data = await tmdbFetch<{genres:Genre[]}>('genre/movie/list',{},fetchFn)
    return data?.genres || null
    
}

export const getMoviesByGenre = async(fetchFn:typeof fetch,id:number):Promise<Movie[]> =>{
    const data = await tmdbFetch<TMDBRespones<{id:number,title:string,backdrop_path:string}>>('discover/movie',{with_genres:id},fetchFn)
    return data?.results || []
    
}

export const getMovieTrailer = async(movieId:number):Promise<Trailer> =>{
    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
    const data = await handleFetchResponse(response)

    const trailer = data?.results.find((video:any)=>{
       return video.type === 'Trailer' && video.site === 'YouTube'
    })

    if(!trailer){
        throw new Error('No trailer found')
    }
    return trailer
}   

export const getMovieById = async(fetchFn:typeof fetch,movieId:string): Promise<MovieDetails | null> =>{
    const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
    return handleFetchResponse(response)
}

export const getSimiliarMovies = async(fetchFn:typeof fetch,movieId:string): Promise<Movie[] | null> =>{
    const response = await fetch(`${BASE_URL}/movie/${movieId}/similar?api_key=${import.meta.env.VITE_TMDB_API_KEY}`)
    const data = await handleFetchResponse(response)
    return data?.results || []
}



export const searchMovies = async(fetchFn:typeof fetch,keyword:string,page:number =1):Promise<Movie[]> =>{

    if(!keyword.trim()){
        return []
    }


    const encodedKeyword = encodeURIComponent(keyword.trim())
    const data = await tmdbFetch<TMDBRespones<{id:number,title:string,backdrop_path:string}>>('search/movie',{query:encodedKeyword,page},fetchFn)
    return data?.results || []
    
}