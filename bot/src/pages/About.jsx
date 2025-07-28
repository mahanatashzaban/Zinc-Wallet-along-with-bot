import React from "react";
import backgroundImage from "../assets/background.png";

const About = () => {
  return (
    <>
      <div
        className="background-image"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="overlay" />

      <div className="content-container" dir="rtl">
        <div className="svg-wrapper">
          <svg
            viewBox="0 0 800 1300"  // افزایش ارتفاع
            className="responsive-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* پس‌زمینه */}
            <rect
              x="0"
              y="0"
              width="800"
              height="1300"
              fill="#36454F"
              rx="20"
              ry="20"
            />

            {/* متن داخل SVG */}
            <foreignObject
              x="10%"
              y="100"
              width="80%"
              height="500"
              className="foreign-object"
            >
              <div className="text-content">
                <p>
                  زینک با کمک الگوریتم یادگیری ماشین ساخته شده و از روش‌ها و متدهای
                  منسوخ شده نمی‌باشد. این ربات بصورت شبانه‌روزی برای شما و بجای شما وارد
                  معامله می‌شود و دیگر نیازی به نشستن پای چارت و نمودارها نیست.
                </p>
                {/* بقیه متن */}
                <p>
                   زینک برای بازارهای ارز دیجیتال طراحی شده است و بزودی برای سایر
                  بازارهای مالی مثل فارکس نیز در دسترس کاربران قرار خواهد گرفت. این ربات
                  در معاملات خود حد ضرر تعیین کرده است و تست‌هایی که در دوره‌های مختلف
                  گرفته‌ایم نشان داده که برای هدف سود ۳۰ درصد ماهیانه، ماکزیمم ضرر
                  تجربه شده در حدود چند درصد بوده است.
                </p>
                <p>
                  البته همیشه باید توجه داشته باشید که بازارهای مالی دارای ریسک‌ها و
                  خطرات خاص خود هستند و نباید با کل سرمایه زندگی‌تان وارد این بازارها
                  شوید. لطفاً قبل از استفاده از ربات، شرایط و ضوابط مربوطه را به دقت
                  مطالعه کنید. با روشن کردن این ربات، شما پذیرفته‌اید که تمام خطرات
                  احتمالی از دست رفتن سرمایه، حتی کل آن، به عهده خود شماست.
                </p>
                <p>برای اطمینان بیشتر، بهتر است با مبلغ کمی شروع کنید.</p>
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>

      {/* استایل‌ها */}
      <style jsx>{`
        .background-image {
          position: fixed;
          inset: 0;
          background-size: cover;
          background-position: center;
          z-index: 0;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.3);
          z-index: 10;
        }

        .content-container {
          position: relative;
          z-index: 20;
          max-width: 100%;
          margin: 0 auto;
          padding: 1rem;
        }

        .svg-wrapper {
          display: flex;
          justify-content: center;
        }

        .responsive-svg {
          width: 100%;
          max-width: 800px;
          height: auto; /* بهتر است برای حفظ نسبت ابعاد */
          display: block;
        }

        /* استایل متن داخل SVG */
        .text-content {
          color: #fff;
          font-family: Vazirmatn, Arial, sans-serif;
          font-size: 20px; /* سایز پایه */
          line-height: 1.8;
          text-align: justify;
          direction: rtl;
        }

        /* تنظیمات موبایل */
        @media (max-width: 640px) {
          .text-content {
            font-size: 30px; /* فونت بزرگ‌تر برای موبایل */
          }
          .foreign-object {
            height: 1250px; /* ارتفاع بیشتر برای موبایل */
          }
        }
        /* تنظیمات برای سایزهای بزرگ‌تر */
        @media (min-width: 641px) {
          .text-content {
            font-size: 20px; /* سایز مناسب برای دسکتاپ و کوچک‌تر */
          }
          .foreign-object {
            height: 500px; /* ارتفاع مناسب برای دسکتاپ */
          }
        }
      `}</style>
    </>
  );
};

export default About;