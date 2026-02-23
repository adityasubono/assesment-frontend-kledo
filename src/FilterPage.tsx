import { useMemo, useState, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  useLoaderData,
  useSearchParams,
} from 'react-router-dom';

type Region = { id: number; name: string };
type Province = Region;
type Regency = Region & { province_id: number };
type District = Region & { regency_id: number };

type RegionData = {
  provinces: Province[];
  regencies: Regency[];
  districts: District[];
};

const regionLoader = async (): Promise<RegionData> => {
  try {
    const response = await fetch('/data/indonesia_regions.json');
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Failed to load region data:', error);
    return { provinces: [], regencies: [], districts: [] };
  }
};

function useTimedLoading(delay = 500) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(timeout);
  }, [loading, delay]);

  const start = () => setLoading(true);

  return { loading, start };
}

function RegionFilter() {
  const data = useLoaderData() as RegionData;
  const [searchParams, setSearchParams] = useSearchParams();

  const { loading: loadingProvince, start: startProvinceLoading } = useTimedLoading();
  const { loading: loadingRegency, start: startRegencyLoading } = useTimedLoading();
  const { loading: loadingDistrict, start: startDistrictLoading } = useTimedLoading();

  const selectedProvId = searchParams.get('province');
  const selectedRegId = searchParams.get('regency');
  const selectedDistId = searchParams.get('district');

  const availableRegencies = useMemo(() => {
    if (!selectedProvId) return [];
    return data.regencies.filter((r) => r.province_id === Number(selectedProvId));
  }, [data.regencies, selectedProvId]);

  const availableDistricts = useMemo(() => {
    if (!selectedRegId) return [];
    return data.districts.filter((d) => d.regency_id === Number(selectedRegId));
  }, [data.districts, selectedRegId]);

  const provName = data.provinces.find((p) => p.id === Number(selectedProvId))?.name;
  const regName = data.regencies.find((r) => r.id === Number(selectedRegId))?.name;
  const distName = data.districts.find((d) => d.id === Number(selectedDistId))?.name;

  const handleProvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    startProvinceLoading();
    if (val) {
      setSearchParams({ province: val });
    } else {
      setSearchParams({});
    }
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    startRegencyLoading();
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('regency', val);
      newParams.delete('district');
    } else {
      newParams.delete('regency');
      newParams.delete('district');
    }
    setSearchParams(newParams);
  };

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    startDistrictLoading();
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set('district', val);
    } else {
      newParams.delete('district');
    }
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchParams({});
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-800">
      <aside className="w-full md:w-[320px] bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 md:p-6 flex flex-col md:h-screen md:sticky md:top-0">
        <div className="flex items-center justify-between md:justify-start gap-3 mb-6 md:mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-base md:text-lg font-bold text-slate-900">Frontend Assessment</h1>
          </div>
          <span className="md:hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Filter
          </span>
        </div>

        <div className="hidden md:block text-[10px] font-bold text-slate-400 mb-4 tracking-widest uppercase">
          Filter Wilayah
        </div>

        <div className="grid grid-cols-1 md:flex md:flex-col gap-4 md:gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase">Provinsi</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              <select
                name="province"
                className="border border-slate-300 rounded-lg p-2.5 pl-10 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-full bg-white appearance-none cursor-pointer"
                value={selectedProvId || ''}
                onChange={handleProvChange}
              >
                <option value="">Pilih Provinsi</option>
                {data.provinces.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            {loadingProvince && (
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                <span>Memuat data provinsi...</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase">Kota/Kabupaten</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <select
                name="regency"
                className="border border-slate-300 rounded-lg p-2.5 pl-10 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-full bg-white appearance-none disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                value={selectedRegId || ''}
                onChange={handleRegChange}
                disabled={!selectedProvId}
              >
                <option value="">Pilih Kota/Kabupaten</option>
                {availableRegencies.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            {loadingRegency && (
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                <span>Memuat data kota/kabupaten...</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase">Kecamatan</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <select
                name="district"
                className="border border-slate-300 rounded-lg p-2.5 pl-10 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-full bg-white appearance-none disabled:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                value={selectedDistId || ''}
                onChange={handleDistChange}
                disabled={!selectedRegId}
              >
                <option value="">Pilih Kecamatan</option>
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            {loadingDistrict && (
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                <span>Memuat data kecamatan...</span>
              </div>
            )}
          </div>
          <button
            onClick={handleReset}
            className="w-full py-3 border border-blue-600 text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-[11px] tracking-wide cursor-pointer mt-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth={2} strokeLinecap="round" /></svg>
            RESET
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] md:min-h-screen bg-white">
        <nav className="breadcrumb border-b border-slate-100 px-4 md:px-6 py-4 md:py-6 flex items-center min-h-[56px] md:h-[80px]">
          <div className="text-xs md:text-sm font-semibold flex flex-wrap items-center gap-2 text-slate-400">
            <span>Indonesia</span>
            {(provName || loadingProvince) && (
              <>
                <span className="font-light">›</span>
                <span className={regName && !loadingProvince ? 'text-slate-400' : 'text-blue-600'}>
                  {loadingProvince ? (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <span className="w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                      <span>Memuat provinsi...</span>
                    </span>
                  ) : (
                    provName
                  )}
                </span>
              </>
            )}
            {(regName || loadingRegency) && (
              <>
                <span className="font-light">›</span>
                <span className={distName && !loadingRegency ? 'text-slate-400' : 'text-blue-600'}>
                  {loadingRegency ? (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <span className="w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                      <span>Memuat kota/kab...</span>
                    </span>
                  ) : (
                    regName
                  )}
                </span>
              </>
            )}
            {(distName || loadingDistrict) && (
              <>
                <span className="font-light">›</span>
                <span className="text-blue-600">
                  {loadingDistrict ? (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <span className="w-3 h-3 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                      <span>Memuat kecamatan...</span>
                    </span>
                  ) : (
                    distName
                  )}
                </span>
              </>
            )}
          </div>
        </nav>

        <main className="flex-1 px-4 md:px-10 py-8 md:py-10 flex flex-col items-center justify-center gap-6 md:gap-8">
          {(provName || loadingProvince) && (
              <div className="text-center">
              <div className="text-[11px] font-bold text-blue-400 tracking-[0.2em] uppercase mb-2">Provinsi</div>
              {loadingProvince ? (
                <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-md mx-auto" />
              ) : (
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#1a2332] tracking-tight">{provName}</h1>
              )}
            </div>
          )}

          {(regName || loadingRegency) && (
            <>
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              <div className="text-center">
                <div className="text-[11px] font-bold text-blue-400 tracking-[0.2em] uppercase mb-2">Kota / Kabupaten</div>
                {loadingRegency ? (
                  <div className="h-9 w-40 bg-slate-100 animate-pulse rounded-md mx-auto" />
                ) : (
                  <h2 className="text-2xl md:text-4xl font-extrabold text-[#1a2332] tracking-tight">{regName}</h2>
                )}
              </div>
            </>
          )}

          {(distName || loadingDistrict) && (
            <>
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              <div className="text-center">
                <div className="text-[11px] font-bold text-blue-400 tracking-[0.2em] uppercase mb-2">Kecamatan</div>
                {loadingDistrict ? (
                  <div className="h-8 w-36 bg-slate-100 animate-pulse rounded-md mx-auto" />
                ) : (
                  <h3 className="text-xl md:text-3xl font-extrabold text-[#1a2332] tracking-tight">{distName}</h3>
                )}
              </div>
            </>
          )}

          {!provName && (
            <div className="relative flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-4 text-slate-400 text-sm font-medium text-center md:text-left">
              <div className="flex md:hidden items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-500 animate-bounce shadow-sm mb-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
              <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-500 animate-bounce shadow-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
              <div className="relative px-4 py-3 rounded-lg bg-blue-50 border border-dashed border-slate-200 shadow-sm max-w-md">
                <div className="hidden md:block absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 border-l border-t border-slate-200 rotate-45" />
                <div className="text-[14px] md:text-[20px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">
                  Informasi!
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse " />
                  <span className="text-[13px] md:text-[17px]">
                    Silahkan pilih filter wilayah provinsi yang ada di Indonesia di sebelah kiri.
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '*',
    loader: regionLoader,
    element: <RegionFilter />,
  },
]);

export default function FilterPage() {
  return <RouterProvider router={router} />;
}