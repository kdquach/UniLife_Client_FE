import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

function HomeCommunitySection({ images = [] }) {
   const navigate = useNavigate();

   const lineArts = [
      'https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img55.svg',
      'https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img4.svg',
      'https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img3.svg',
      'https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img2.svg',
      'https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/branch-item-img1.svg',
   ];

   const fallbackCampuses = [
      {
         id: 'campus-hn',
         title: 'Campus Hà Nội',
         subtitle: 'Không gian học tập năng động và hệ thống căn tin hiện đại.',
         src: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
      },
      {
         id: 'campus-hcm',
         title: 'Campus TP.HCM',
         subtitle: 'Hệ sinh thái ẩm thực đa dạng, đáp ứng mọi khung giờ trong ngày.',
         src: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80',
      },
      {
         id: 'campus-da-nang',
         title: 'Campus Đà Nẵng',
         subtitle: 'Khuôn viên thoáng đãng với trải nghiệm đặt món nhanh chóng.',
         src: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80',
      },
      {
         id: 'campus-quy-nhon',
         title: 'Campus Quy Nhơn',
         subtitle: 'Mô hình căn tin thông minh, tối ưu trải nghiệm sinh viên.',
         src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
      },
      {
         id: 'campus-can-tho',
         title: 'Campus Cần Thơ',
         subtitle: 'Điểm đến ẩm thực học đường với menu linh hoạt mỗi ngày.',
         src: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
      },
   ];

   const safeImages = Array.isArray(images) && images.length > 0 ? images : fallbackCampuses;

   return (
      <section className="relative mx-auto max-w-[1240px] overflow-hidden bg-transparent px-4 py-14">
         <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
               backgroundImage: 'linear-gradient(to right, rgba(148,163,184,0.24) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.24) 1px, transparent 1px)',
               backgroundSize: '42px 42px',
            }}
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
               backgroundImage: 'radial-gradient(rgba(100,116,139,0.45) 1.1px, transparent 1.1px)',
               backgroundSize: '20px 20px',
            }}
         />
         <img
            src="https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/info-bg.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute right-[-80px] top-10 hidden w-[500px] opacity-45 lg:block"
         />
         <img
            src="https://daihoc.fpt.edu.vn/wp-content/themes/fpt-university/assets/images/info-img.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute left-[-110px] bottom-6 hidden w-[300px] opacity-40 lg:block"
         />

         <div className="relative mb-10 flex items-end justify-between">
            <div className="max-w-[880px]">
               <h2 className="text-3xl font-bold text-orange-500 md:text-4xl">Campus</h2>
               <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base">
                  UniLife kết nối hệ thống căn tin tại nhiều cơ sở, mang đến trải nghiệm đặt món đồng nhất,
                  thuận tiện và nhanh chóng cho sinh viên ở mọi campus.
               </p>
               <div className="mt-4 h-1.5 w-full max-w-[620px] rounded-full bg-[repeating-linear-gradient(45deg,#f97316_0,#f97316_10px,transparent_10px,transparent_16px)]" />
            </div>
         </div>

         <div className="relative grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {safeImages.slice(0, 5).map((image, idx) => (
               <article
                  key={image.id}
                  className="group overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1"
               >
                  {/* illustration */}
                  <div className="flex h-36 w-full items-center justify-center bg-white/50">
                     <img
                        src={lineArts[idx % lineArts.length]}
                        alt=""
                        className="h-[90px] w-auto object-contain transition duration-300 group-hover:scale-110"
                        loading="lazy"
                     />
                  </div>

                  {/* content */}
                  <div className="px-3 py-3">
                     <h3 className="flex items-center gap-1.5 text-xs font-semibold text-text sm:text-sm">
                        <MapPin size={13} className="text-orange-500" />
                        {image.title || `Campus ${idx + 1}`}
                     </h3>

                     <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                        {image.subtitle ||
                           "Hệ thống căn tin và dịch vụ đặt món hiện đại trong khuôn viên trường."}
                     </p>

                     <button
                        type="button"
                        onClick={() => navigate("/menu")}
                        className="mt-3 rounded-full bg-orange-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-orange-600"
                     >
                        Xem căn tin
                     </button>
                  </div>
               </article>
            ))}
         </div>
      </section>
   );
}

export default memo(HomeCommunitySection);
