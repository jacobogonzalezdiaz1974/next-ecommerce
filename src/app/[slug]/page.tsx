import Add from "@/components/Add";
import CustomizeProduct from "@/components/CustomizeProduct";
import ProductImages from "@/components/ProductImages";
import { wixClientServer } from "@/lib/wixClientServer";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

const SinglePage = async ({ params }: { params: { slug: string } }) => {
  

  const wixClient = await wixClientServer();

  const products = await wixClient.products
    .queryProducts()
    .eq("slug", params.slug)
    //.limit(limit || PRODUCT_PER_PAGE)
    .find();
  
  if (!products.items[0]) {
    return notFound()
  }

  const product = products.items[0];

  const reviewRes = await fetch(`https://api.fera.ai/v3/public/reviews?product.id=${product._id}&publick_key=${process.env.NEXT_PUBLIC_FERA_ID}`);
  const reviews = await reviewRes.json()


  return (
    <div className="px-4 md:px-8 lg:px-16 xl:32 2xl:px-64 relative flex flex-col lg:flex-row gap-16">
      {/**IMG */}
      <div className="w-full lg:w-1/2 lg:sticky top-20 h-max">
        <ProductImages items={product.media?.items} />
      </div>
      {/**TEXT */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <h1 className="text-4xl- font-medium">{product.name}</h1>
        <p className="text-gray-500">{product.description}</p>
        <div className="h-[2px] bg-gray-100" />
        {product.price?.price === product.price?.discountedPrice ? (
          <h2 className="font-medium text-2xl">€ {product.price?.price}</h2>
        ) : (
          <div className="flex items-center gap-4">
            <h3 className="text-xl text-gray-500 line-through">
              {product.price?.price}
            </h3>
            <h2 className="font-medium text-2xl">
              € {product.price?.discountedPrice}
            </h2>
          </div>
        )}

        <div className="h-[2px] bg-gray-100" />
        {product.variants && product.productOptions ? (
          <CustomizeProduct
            productId={product._id!}
            variants={product.variants}
            productOptions={product.productOptions}
          />
        ) : (
          <Add
            productId={product._id!}
            variantId={"00000000-0000-0000-0000-000000000000"}
            stockNumber={product.stock?.quantity || 0}
          />
        )}
        <div className="h-[2px] bg-gray-100" />

        {product.additionalInfoSections?.map((section: any) => (
          <div className="text-sm" key={section.title}>
            <h4 className="font-medium mb-4">{section.title}</h4>
            <p>{section.description}</p>
          </div>
        ))}
        <div className="h-[2px] bg-gray-100" />
        {/**REVIEWS */}
        <h1 className="">User Reviews</h1>
        {reviews.data.map((review: any) => (
          <div className="flex flex-col gap-4" key={review.id}>
            {/**USER */}
            <div className="flex items-center gap-4 font-medium">
              <Image src={review.customer.avatar_url} alt='' width={32} height={32} className="rounded-full" />
              <span className="">{ review.customer.display_name}</span>
            </div>
            {/**STARS */}
            <div className="flex gap-2">
              {Array.from({ length: reviews.rating }).map((_, index) => (
                <Image src='/star.png' alt="" key={index} width={16} height={16} />
              ))}
            </div>
            {/**DESC */}
            {reviews.heading && <p className="">{review.heading}</p>}
             {reviews.body && <p className="">{review.body}</p>}
            <div className="">
              {reviews.media.map((media: any) => (
                <Image src={ media.url} key={media.id} alt="" width={100} hei/>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SinglePage;
