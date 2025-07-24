<script lang="ts">
    import {Header,HeroSection,Carousel,Player} from "$components"
    import { popularMovies, selectedMovie } from "$lib/store/GlobalState";

    let {
        data,
    }: {
        data: {
            popularMovies: Movie[];
            selectedMovie: MovieDetails;
            moviesByGenres: MoviesWithGenre[];
            topRatedMovies: Movie[];
            trendingMovies: Movie[];
        };
    } = $props();

    $effect.pre(() => {
        popularMovies.set(data.popularMovies);
        selectedMovie.set(data.selectedMovie);
    });
    // 考虑使用 $derived 替代 $effect（如果只是数据转换）：
    // $derived(popularMovies.set(data.popularMovies));
    // console.log(data.moviesByGenres);
</script>


<div class="relative text-white">
    <HeroSection />
    <div
        class="absolute w-full top-[35vh] md:top-[65vh] lg:top-[85vh] pl-10 flex flex-col space-y-4"
    >
        <Carousel title="Popular Movies" items={data.popularMovies} />
        <Carousel title="Trending Movies" items={data.trendingMovies} />
        <Carousel title="Top-Rated Movies" items={data.topRatedMovies} />

        {#each data.moviesByGenres as moviesList}
            <Carousel title={moviesList.name} items={moviesList.movies} />
        {/each}
    </div>
    <!-- <Player/> -->
</div>
