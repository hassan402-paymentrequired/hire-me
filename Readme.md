{/* Location Card */}
<div className="bg-card rounded border p-3 space-y-4">
<div className="space-y-4">
<div className="flex items-start gap-3">
<div className="flex-1">
<h4 className="font-semibold text-sm">Location</h4>
<p className="text-sm text-muted-foreground">{provider.address}</p>
{distance !== null && (
<p className="text-xs font-bold text-primary mt-1">
{distance.toFixed(1)} km from your location
</p>
)}
</div>
</div>
<Button onClick={getDirections} variant="outline" className="w-full">
<Navigation className="size-4" />
Get Directions
</Button>
</div>

                            {googleMapsApiKey && provider.latitude && provider.longitude && (
                                <div className="rounded border overflow-hidden  h-64">
                                    <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
                                        <GoogleMap
                                            mapContainerStyle={{ width: '100%', height: '100%' }}
                                            center={{ lat: provider.latitude, lng: provider.longitude }}
                                            zoom={15}
                                            options={{
                                                disableDefaultUI: true,
                                                zoomControl: true,
                                            }}
                                        >
                                            <Marker position={{ lat: provider.latitude, lng: provider.longitude }} />
                                        </GoogleMap>
                                    </LoadScript>
                                </div>
                            )}
                        </div>
