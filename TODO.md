> TODOs expl

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
