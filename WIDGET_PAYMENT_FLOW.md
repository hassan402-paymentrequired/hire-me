 {/* Quick Stats */}
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-4 sm:gap-4">
                                {quickStats.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="rounded-2xl border border-border/70 bg-card/70 p-3 sm:p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                                                    {stat.label}
                                                </p>
                                                {stat.label === 'Rating' ? (
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                                        <p className="text-2xl font-semibold text-foreground sm:text-3xl">
                                                            {stat.value}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
                                                        {stat.value}
                                                    </p>
                                                )}
                                            </div>
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/50 ${stat.accent}`}
                                            >
                                                <KeenIcon
                                                    name={stat.icon}
                                                    className="text-base"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>