import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, User, Tag, ArrowRight } from 'lucide-react'
import { blogPosts } from '../../data/blogData'
import '../../styles/ecosystem.css'

function formatDate(dateStr) {
    try {
        return new Date(dateStr).toLocaleDateString()
    } catch {
        return dateStr
    }
}

export default function BlogList() {
    return (
        <div className="eco-container">
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 className="eco-title-gradient">Knowledge Base</h1>
                <p className="eco-subtitle">Chia sẻ kiến thức về An toàn thông tin, DevOps và lập trình.</p>
            </header>

            <div className="blog-grid">
                {blogPosts.map(post => (
                    <article key={post.id} className="blog-card">
                        <div className="blog-content">
                            <div className="blog-meta">
                                <Calendar size={14} /> {formatDate(post.date)}
                                <span>•</span>
                                <User size={14} /> {post.author}
                            </div>

                            <h2 className="blog-title">
                                <Link to={`/blog/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {post.title}
                                </Link>
                            </h2>

                            <p className="blog-excerpt">
                                {post.desc}
                            </p>

                            <div className="blog-footer">
                                <div className="blog-tags">
                                    {post.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="blog-tag">
                                            <Tag size={10} style={{ marginRight: '4px' }} /> {tag}
                                        </span>
                                    ))}
                                </div>

                                <Link to={`/blog/${post.id}`} className="blog-link">
                                    Read <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    )
}
