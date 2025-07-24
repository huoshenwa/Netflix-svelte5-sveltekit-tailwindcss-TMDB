import type { RequestHandler } from "@sveltejs/kit";
import { getMovieTrailer } from "$lib/api/API"; 


export const GET:RequestHandler = async({params})=>{
    const {id} = params

    if(!id){
        return new Response(JSON.stringify({error:"No Movie ID provided"}),{
            status:400,
            headers:{
                'content-type': 'application/json'
            }
        })
    }

    try {
        const trailer = await getMovieTrailer(parseInt(id, 10))
        return new Response(JSON.stringify({trailer}),{
            status:200,
            headers:{
                'content-type': 'application/json'
            }
        })
    } catch (error:any) {
        return new Response(JSON.stringify({error:error.message}),{
            status:500,
            headers:{
                'content-type': 'application/json'
            }
        })
    }
}