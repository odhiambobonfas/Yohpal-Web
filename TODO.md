> TODOs expl


NOTE(0f80476cffa0) :: Prod only functionality
---
The reason this exists is I noticed that number of reads had gone up,
tried caching but realised its well covered by *TODO(db9c9e8f0254)*
wraps the expensive functions that in dev mode arent really needed
to have the accurate data, pass in the function and its default data to be used
in dev mode.
This is only available to server side stuff cause during dev Ill rarely get past the 30,
client side has `useSWR` which handles the caching.


TODO(253894320916) :: Handle infinite scroll for both directions
---
Currently infinite scroll only works oneway, forwards, what if they want to go backwards
not a problem for right now, but possibly handle this in the future

TODO(80186fb26301) :: Comment deletes
---
Currently soft deletes comments because firebase doesnt have cascade deletes
To actually delete a document and its children (subcollections), you need to
either set a cloud function that listens on `onDelete` actions/events on the db
and recursively deletes the children, or use the admin SDK and call recursively delete
yourself everytime someone deletes a comment.

TODO(f0bfff672065) :: Add remaining remaining filters on videos
---
When fetching the videos, only fetch videos that are allowed for everyone to see
based on the `privacy` of the video, I only know of *Everyone* and *Only Me*. There
are more privacy filters/options, I haven't found them all and the people who set them up
aren't here anymore, so updated this when you find more


TODO(583fae8a3d42) :: Handle nested objects
---
Next doesnt play nice with nested objects, especially when passing them down from
server rendered pages ie initial page, to go around this, I just *delete* the `campaignMeta`
field until I find a better of handling it, I though about stringifying it, passing it then
parsing it back to JSON, but that was annoying and there has to be a better way


TODO(3467633a0185) :: Get policies dynamically/correct ones
---
Retrieve these policies from somewhere dynamic or remind Md. Elizabeth to share the
document and basically summarize all of them into the different scenarios, explanations
aren't needed.


TODO(db9c9e8f0254) :: Cache implementation
---
Current implementation provides a simple api that takes in the fetcher, key and tags.
tags are used because we relyon Next's [`unstable_cache`](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
when cache becomes stable, we can use that, but this impl has a drawback in that
it gets reset on app re/build (this includes redeplyoment) and is turned off by default in
dev mode, still haven;t found a way to force it on in dev, but it should be replaced with an
externally managed cache instance, redis,memcached,vulkan,dragonfly take your pick.
