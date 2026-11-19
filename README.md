# moovingsloth.github.io

Plain static site: no generator, no build step. Edit the HTML and push.

- `index.html`: home page (intro, project player, experience)
- `projects/<slug>/index.html`: one page per project
- `assets/css/site.css`, `assets/js/site.js`: the only stylesheet and script
- `assets/projects/<slug>/`: each project's media
  - `film.mp4`, `film.jpg`: the explainer film and its poster
  - `thumb.jpg`: playlist thumbnail
  - `cover.mp4`, `cover.jpg`: the looping cover at the top of the page
  - `still-N.jpg`: frames from the film used as figures
- `tools/films/`: sources for the explainer films

## Re-rendering a film

Each film is an HTML page whose CSS animations are driven frame by frame.

    pip install playwright && playwright install chromium   # ffmpeg must be on PATH
    cd tools/films
    python3 render.py long-video-kv stills   # preview frames in out/long-video-kv/
    python3 render.py long-video-kv          # writes out/long-video-kv.mp4
    python3 render.py long-video-kv full 1   # re-render only scene 1, then rejoin

Copy the result to `assets/projects/<slug>/film.mp4`.

## Adding a project to the home player

Copy one `<li>` in the `.list` on the home page and point `data-film`, `data-poster`, `data-when`, `data-sum` and `href` at the new project.
