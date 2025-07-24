<script lang="ts">
    import { goto } from "$app/navigation";
    import { closeModal } from "$lib/store/GlobalState";
    import { handleNoImageError } from "$lib/utils/helpers";
    import { Play } from "lucide-svelte";


    let {description="",id="",title="",imageUrl="",duration="22m"}:{
        description:string,id:string,title:string,imageUrl:string,duration:string
    } = $props()
    let match :string = "67% Match"
    let rating : string = "5+"
    console.log(imageUrl);
    

</script>



<div class="bg-[#181818] text-white rounded-lg shadow-md sm:w-48 w-40">

    <div class="relative">
        <img src={imageUrl} alt={title} onerror={handleNoImageError} 
        class="rounded-t-lg w-full h-40 object-cover" >

        <div class="absolute top-2 right-2 bg-[#000000b3] text-white px-2 py-0.5 rounded-md text-sm font-semibold">
            {duration}
        </div>

        <div class="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent"></div>

        <h3 class="absolute bottom-0 left-2 font-semibold text-base mb-1.5">{title}</h3>
    </div>

    <div class="p-3">
        <div class="flex flex-col text-sm mb-1">
            <div class="flex justify-between">
                <div class="flex flex-col justify-between items-center">
                    <div class="text-[#46d369]">
                        <span>{match}</span>
                    </div>
                    <div class="text-[#b3b3b3]">
                        <span class="px-1 mr-2 border-[#b3b3b3] border">{rating}</span>
                        <span>2023</span>
                    </div>
                </div>

                <div>
                    <button
                    onclick={()=>{
                        goto(`watch/${id}`)
                        closeModal()
                    }}
                        class="rounded-full transition-colors duration-200 p-3 border-2 border-gray-700 hover:border-white"
                    >
                        <Play class="text-white h-6 w-6" /></button
                    >
                </div>
            </div>
        </div>
        <p class="text-xs text-[#b3b3b3] mb-3 leading-tight">{description.substring(0,50)+ "..."}</p>
    </div>

</div>