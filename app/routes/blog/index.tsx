import * as React from 'react'
import sortBy from 'sort-by'
import {useRouteData, Link} from '@remix-run/react'
import type {KCDLoader, PostListItem} from 'types'
import {json} from '@remix-run/data'
import {downloadMdxListItemsInDir} from '../../utils/github.server'

export const loader: KCDLoader = async ({context}) => {
  const posts = (await downloadMdxListItemsInDir(context.octokit, 'blog')).sort(
    sortBy('-frontmatter.published'),
  )

  return json(posts)
}

export function headers() {
  return {
    'cache-control': 'public, max-age=10',
  }
}

export function meta() {
  return {
    title: 'Blog | Kent C. Dodds',
    description: 'This is the Kent C. Dodds blog',
  }
}

function BlogHome() {
  const posts = useRouteData<Array<PostListItem>>()
  return (
    <div>
      <header>
        <h1>Kent C. Dodds</h1>
      </header>
      <main>
        {posts.map(post => (
          <p key={post.slug}>
            <Link to={`/blog/${post.slug}`}>{post.frontmatter.meta.title}</Link>
            <br />
            <small>{post.frontmatter.meta.description}</small>
          </p>
        ))}
      </main>
    </div>
  )
}

export default BlogHome
