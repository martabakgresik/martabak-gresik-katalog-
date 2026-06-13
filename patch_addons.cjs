const fs = require('fs');
let content = fs.readFileSync('src/views/AdminDashboard.tsx', 'utf8');

const addonsUI = `
          {activeTab === 'addons' && (
            <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.3}}>
              <div className="mb-8">
                <h2 className="text-2xl font-black uppercase flex items-center gap-3">
                  <span className="w-2 h-8 bg-brand-orange rounded-full"></span>
                  Harga Add-ons / Topping
                </h2>
                <p className="opacity-60 font-medium mt-2">Kelola topping tambahan untuk Terang Bulan dan Martabak Telor.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* SWEET ADDONS */}
                <div className="bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[2rem] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black flex items-center gap-2 text-brand-orange">
                      <Pizza className="w-6 h-6" />
                      Topping Manis
                    </h3>
                    <button onClick={() => {
                      setConfig({...config, addonsSweet: [...(config.addonsSweet || []), { name: 'Topping Baru', price: 0, minQty: 1, maxQty: 20, defaultQty: 1, disabled: false }]});
                    }} className="bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange p-2 rounded-xl transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(config.addonsSweet || []).map((addon: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3 group relative">
                        <div className="flex justify-between items-start gap-2">
                          <input
                            type="text"
                            value={addon.name}
                            onChange={(e) => {
                              const newAddons = [...config.addonsSweet];
                              newAddons[idx].name = e.target.value;
                              setConfig({...config, addonsSweet: newAddons});
                            }}
                            className="font-bold text-lg bg-transparent border-b border-transparent focus:border-brand-orange focus:outline-none flex-1"
                            placeholder="Nama Topping"
                          />
                          <button onClick={() => {
                            const newAddons = [...config.addonsSweet];
                            newAddons.splice(idx, 1);
                            setConfig({...config, addonsSweet: newAddons});
                          }} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col flex-1">
                            <span className="text-[10px] font-bold opacity-50 uppercase">Harga (+Rp)</span>
                            <input
                              type="number"
                              value={addon.price}
                              onChange={(e) => {
                                const newAddons = [...config.addonsSweet];
                                newAddons[idx].price = parseInt(e.target.value) || 0;
                                setConfig({...config, addonsSweet: newAddons});
                              }}
                              className="font-black text-brand-orange bg-transparent focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold opacity-60 flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={!addon.disabled}
                                onChange={(e) => {
                                  const newAddons = [...config.addonsSweet];
                                  newAddons[idx].disabled = !e.target.checked;
                                  setConfig({...config, addonsSweet: newAddons});
                                }}
                                className="accent-brand-orange"
                              /> Tersedia
                            </label>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-black/5 dark:border-white/5 pt-3 mt-1">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold opacity-50 uppercase mb-1">Min Qty</span>
                            <input type="number" value={addon.minQty} onChange={e => { const n = [...config.addonsSweet]; n[idx].minQty = parseInt(e.target.value)||1; setConfig({...config, addonsSweet: n})}} className="bg-black/5 dark:bg-white/5 rounded-md px-2 py-1 text-sm font-bold text-center outline-none focus:ring-1 ring-brand-orange" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold opacity-50 uppercase mb-1">Max Qty</span>
                            <input type="number" value={addon.maxQty} onChange={e => { const n = [...config.addonsSweet]; n[idx].maxQty = parseInt(e.target.value)||20; setConfig({...config, addonsSweet: n})}} className="bg-black/5 dark:bg-white/5 rounded-md px-2 py-1 text-sm font-bold text-center outline-none focus:ring-1 ring-brand-orange" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold opacity-50 uppercase mb-1">Default Qty</span>
                            <input type="number" value={addon.defaultQty} onChange={e => { const n = [...config.addonsSweet]; n[idx].defaultQty = parseInt(e.target.value)||1; setConfig({...config, addonsSweet: n})}} className="bg-black/5 dark:bg-white/5 rounded-md px-2 py-1 text-sm font-bold text-center outline-none focus:ring-1 ring-brand-orange" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {(config.addonsSweet?.length === 0) && (
                      <div className="text-center p-6 opacity-50 font-bold border-2 border-dashed border-black/10 rounded-xl">Belum ada topping manis</div>
                    )}
                  </div>
                </div>

                {/* SAVORY ADDONS */}
                <div className="bg-white/50 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-[2rem] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black flex items-center gap-2 text-brand-orange">
                      <EggFried className="w-6 h-6" />
                      Topping Asin
                    </h3>
                    <button onClick={() => {
                      setConfig({...config, addonsSavory: [...(config.addonsSavory || []), { name: 'Topping Baru', price: 0, minQty: 1, maxQty: 20, defaultQty: 1, disabled: false }]});
                    }} className="bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange p-2 rounded-xl transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(config.addonsSavory || []).map((addon: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3 group relative">
                        <div className="flex justify-between items-start gap-2">
                          <input
                            type="text"
                            value={addon.name}
                            onChange={(e) => {
                              const newAddons = [...config.addonsSavory];
                              newAddons[idx].name = e.target.value;
                              setConfig({...config, addonsSavory: newAddons});
                            }}
                            className="font-bold text-lg bg-transparent border-b border-transparent focus:border-brand-orange focus:outline-none flex-1"
                            placeholder="Nama Topping"
                          />
                          <button onClick={() => {
                            const newAddons = [...config.addonsSavory];
                            newAddons.splice(idx, 1);
                            setConfig({...config, addonsSavory: newAddons});
                          }} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col flex-1">
                            <span className="text-[10px] font-bold opacity-50 uppercase">Harga (+Rp)</span>
                            <input
                              type="number"
                              value={addon.price}
                              onChange={(e) => {
                                const newAddons = [...config.addonsSavory];
                                newAddons[idx].price = parseInt(e.target.value) || 0;
                                setConfig({...config, addonsSavory: newAddons});
                              }}
                              className="font-black text-brand-orange bg-transparent focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-bold opacity-60 flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={!addon.disabled}
                                onChange={(e) => {
                                  const newAddons = [...config.addonsSavory];
                                  newAddons[idx].disabled = !e.target.checked;
                                  setConfig({...config, addonsSavory: newAddons});
                                }}
                                className="accent-brand-orange"
                              /> Tersedia
                            </label>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-black/5 dark:border-white/5 pt-3 mt-1">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold opacity-50 uppercase mb-1">Min Qty</span>
                            <input type="number" value={addon.minQty} onChange={e => { const n = [...config.addonsSavory]; n[idx].minQty = parseInt(e.target.value)||1; setConfig({...config, addonsSavory: n})}} className="bg-black/5 dark:bg-white/5 rounded-md px-2 py-1 text-sm font-bold text-center outline-none focus:ring-1 ring-brand-orange" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold opacity-50 uppercase mb-1">Max Qty</span>
                            <input type="number" value={addon.maxQty} onChange={e => { const n = [...config.addonsSavory]; n[idx].maxQty = parseInt(e.target.value)||20; setConfig({...config, addonsSavory: n})}} className="bg-black/5 dark:bg-white/5 rounded-md px-2 py-1 text-sm font-bold text-center outline-none focus:ring-1 ring-brand-orange" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold opacity-50 uppercase mb-1">Default Qty</span>
                            <input type="number" value={addon.defaultQty} onChange={e => { const n = [...config.addonsSavory]; n[idx].defaultQty = parseInt(e.target.value)||1; setConfig({...config, addonsSavory: n})}} className="bg-black/5 dark:bg-white/5 rounded-md px-2 py-1 text-sm font-bold text-center outline-none focus:ring-1 ring-brand-orange" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {(config.addonsSavory?.length === 0) && (
                      <div className="text-center p-6 opacity-50 font-bold border-2 border-dashed border-black/10 rounded-xl">Belum ada topping asin</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-3 shadow-xl shadow-brand-orange/20 hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
                >
                  {saving ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> MENYIMPAN...</>
                  ) : (
                    <><Save className="w-6 h-6" /> SIMPAN ADD-ONS</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
`;

content = content.replace('{/* Confirm Dialog Modal */}', addonsUI + '\n      {/* Confirm Dialog Modal */}');

fs.writeFileSync('src/views/AdminDashboard.tsx', content);
console.log('Done!');
