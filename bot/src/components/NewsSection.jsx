import React, { useEffect, useState } from "react";
import axios from "axios";
import { db } from "../firebase";
import { doc, setDoc, arrayUnion, increment } from "firebase/firestore";

export default function NewsSection() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    axios.get("https://jubilant-space-disco-9755jqrvqxgwcpg49-5000.app.github.dev/api/news")
      .then(res => setNews(res.data))
      .catch(e => console.error("News fetch error:", e));
  }, []);

  const handleLike = async (id) =>
    setDoc(doc(db, "newsLikes", id), { count: increment(1) }, { merge: true });

  const handleComment = async (id) => {
    const comment = prompt("نظر خود را بنویسید:");
    if (comment)
      setDoc(doc(db, "newsComments", id), { list: arrayUnion(comment) }, { merge: true });
  };

  return (
    <section dir="rtl" className="py-8 max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-orange-600 mb-6 text-center">
        📢 جدیدترین اخبار ارز دیجیتال
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.map(item => (
          <article
            key={item.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col justify-between"
            itemScope itemType="https://schema.org/NewsArticle"
          >
            <meta itemProp="url" content={item.url} />
            <meta itemProp="datePublished" content={item.date} />
            <meta itemProp="author" content={item.author} />

            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-36 object-cover mb-3 rounded"
              />
            )}

            <h3 className="font-bold text-base mb-2 text-gray-800 line-clamp-2" itemProp="headline">
              {item.title}
            </h3>

            <p className="text-sm text-gray-600 mb-3 line-clamp-3" itemProp="articleBody">
              {item.body}...
            </p>

            <div className="flex flex-wrap gap-1 text-xs text-blue-500 mb-2">
              {item.keywords.map((k, i) => <span key={i}>#{k}</span>)}
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
              <button onClick={() => handleLike(item.id)} className="hover:text-red-500">❤️ پسند</button>
              <button onClick={() => handleComment(item.id)} className="hover:text-blue-600">💬 نظر</button>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-green-600">🔗 منبع</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
