exports.getHttpsGitURL = url => {
  if (url.startsWith('http')) {
    return url.replace('.git', '')
  } else if (url.startsWith('git@')) {
    return url
      .replace(':', '/')
      .replace('git@', 'https://')
      .replace(/.git([^.git]*)$/, '')
  }
  return url
}
