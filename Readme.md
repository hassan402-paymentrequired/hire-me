{/* Desktop Bento Grid */}
<div className="hidden md:grid grid-cols-4 gap-4 auto-rows-[200px]">
{/* Logo - large, featured position */}
{logo && (
<div className={`rounded overflow-hidden border bg-muted relative group ${
                            otherImages.length === 1 ? 'col-span-2 row-span-2' : 'col-span-3 row-span-2'
                        }`}>
<img
src={logo.url}
alt="Business logo"
className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
/>
</div>
)}

                    {/* Other images - smart bento layout */}
                    {otherImages.map((img, i) => {
                        // Special handling when there's only 1 other image (2 total)
                        if (otherImages.length === 1) {
                            return (
                                <div
                                    key={i}
                                    className="col-span-2 row-span-2 rounded overflow-hidden border bg-muted relative group"
                                >
                                    <img
                                        src={img.url}
                                        alt={`Gallery image ${i + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                            );
                        }

                        // Make every 3rd image larger for visual interest when there are more images
                        const isLarge = (i + 1) % 3 === 0;

                        return (
                            <div
                                key={i}
                                className={`rounded overflow-hidden border bg-muted relative group ${
                                    isLarge ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
                                }`}
                            >
                                <img
                                    src={img.url}
                                    alt={`Gallery image ${i + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                        );
                    })}

                    {/* Empty state when no images */}
                    {!logo && otherImages.length === 0 && (
                        <div className="col-span-4 aspect-[21/9] rounded border bg-muted flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No images available</p>
                            </div>
                        </div>
                    )}
                </div>
