# Sequelize Models

## UserAction

Code|Action|Variables
---:|---|---
0|Pause|[songTitle]
1|Resume|[songTitle]
2|Skip|[songTitle]
3|Set Volume|[volume]
4|Toggle Shuffle|[shuffle]
5|Change Repeat|[repeat]
6|Play Song|[songTitle]
7|Play Playlist|[playlistName]
8|Shuffle Play Playlist|[playlistName]
9|Queue Song(s)|[...songTitles]
10|Dequeue Song(s)|[...songTitles]
11|Create Playlist|[playlistName]
12|Rename Playlist|[oldPlaylistName, newPlaylistName]
13|Delete Playlist|[playlistName]
14|Add Song(s)|[playlistTitle, ...songTitles]
15|Delete Song(s)|[playlistTitle, ...songTitles]
