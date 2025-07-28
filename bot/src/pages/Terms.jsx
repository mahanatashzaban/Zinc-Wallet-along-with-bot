import React from "react";

const Terms = () => {
  return (
    <div className="relative p-6 max-w-3xl mx-auto bg-white rounded shadow" style={{ overflow: "hidden" }}>
      {/* پس‌زمینه SVG با رنگ و دایره یا مستطیل */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 600 400"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <rect width="100%" height="100%" fill="#36454F" rx="20" ry="20" />
      </svg>

      {/* متن داخل جعبه، روی SVG */}
      <div className="relative z-10 text-justify text-base leading-7 text-white p-4">
        <h2 className="text-2xl font-bold mb-4 text-right">شرایط و ضوابط</h2>
        <p>
          گروه نرم‌افزاری زینک با کمک الگوریتم ماشین توانست که اولین و یکی از بهترین نرم‌افزارهای خرید و فروش تمام‌اتوماتیک را عرضه کند.
          قبل از استفاده به اطلاع می‌رسانیم با وجود تست‌های مکرر باید توجه داشت که بازارهای مالی همیشه خطرات خود را دارد و شما با فعال کردن ربات
          تأیید می‌کنید که تمام خطرات از دست رفتن حتی کل سرمایه از لحاظ حقوقی بر عهده خود شما می‌باشد و ما به هیچ وجه مسئولیتی در قبال سود و زیان شما نخواهیم داشت.
        </p>
        <p className="mt-4">
          کارمزد استفاده از ربات زینک در حدود ۵ درصد از سود به‌دست‌آمده شما می‌باشد که به‌صورت آنی از حساب کاربر کسر می‌گردد.
          در صورت هرگونه سوال، طرح پیشنهاد و انتقاد، از طریق تیکت یا شماره‌های ثابت اعلام‌شده در سایت و یا نسخه اپلیکیشن زینک مراجعه بفرمایید.
        </p>
      </div>
    </div>
  );
};

export default Terms;