> TODOs/NOTEs



NOTE(d6e453a10692) :: In the shadow
---
The redis first implementation is run in tandem with the old db updating functionality
to ensure that the records are in sync, before the cloud functions takes over.
> Remove the db operations when cloudfunction is live

NOTE(0f80476cffa0) :: Prod only functionality
---
The reason this exists is I noticed that number of reads had gone up,
tried caching but realised its well covered by *TODO(db9c9e8f0254)*
wraps the expensive functions that in dev mode arent really needed
to have the accurate data, pass in the function and its default data to be used
in dev mode.
This is only available to server side stuff cause during dev Ill rarely get past the 30,
client side has `useSWR` which handles the caching.


NOTE(15c5834672a2) :: Why
---
So you may be wondering, why are most of these actions just wrappers,
well my good friend, thats a good question, the reason is decoupling,
they are these way so that when the cloudfunction is fully live, we just remove
the likeVideo, and we are solid, yes it would still be a wrapper but we now have
a place where we can inject anything that needs to be processed before the operation

All database operations live in service, this ensures that theres only one place to make
database op changes, actions are what trigger the operations, be it redis or the actual db,
the client should not care, its basically a blackbox to the application.


TODO(55d45572bb3d) :: Temporary comment replacement
---
Replace the temp comment using the id for now cause the tempId should
be removed from the object when updating the db, its going to be sorted
by the cloud function, just thought this behaviour should be
documented

TODO(5d4b721bf00d) :: Find a better way to handle checking interaction
---
Right now to know if you've like a video we check if we exist in that videos
subcollection, we need to find a better way of getting these values
likes, bookmarked and in the comments if we've liked cause we use the same trick


TODO(253894320916) :: Handle infinite scroll for both directions
---
> *[Partial Resolution]*
> tanstacks virtualization partially solves this because it stores all the data
> its come accross, since we still only ever have 7 items on the dom, its relatively fast
> tested it by autoscrolling 800+ videos and no delay was noticed

Currently infinite scroll only works oneway, forwards, what if they want to go backwards
not a problem for right now, but possibly handle this in the future

TODO(80186fb26301) :: Comment deletes
---
> *[Partial Resolution]*
> Will be handled with cloudfunctions that updates as per the interval that will be decided
> update this as fully resolved when its live

Currently soft deletes comments because firebase doesnt have cascade deletes
To actually delete a document and its children (subcollections), ~you need to
either set a cloud function that listens on `onDelete` actions/events on the db
and recursively deletes the children, or use the admin SDK and call recursively delete
yourself everytime someone deletes a comment.~

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


~TODO(db9c9e8f0254) :: Cache implementation~ *[Resolved]*: Setup redis instance
---
Current implementation provides a simple api that takes in the fetcher, key and tags.
tags are used because we rely on Next's [`unstable_cache`](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
when cache becomes stable, we can use that, but this impl has a drawback in that
it gets reset on app re/build (this includes redeplyoment) and is turned off by default in
dev mode, still haven;t found a way to force it on in dev, but it should be replaced with an
externally managed cache instance, redis,memcached,vulkan,dragonfly take your pick.
