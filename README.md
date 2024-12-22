

git merge upstream/main --allow-unrelated-histories
git push --set-upstream upstream main

git remote add upstream https://github.com/hozt/hozt-astro
git pull upstream main

cp ../hozt-astro/tailwind.config.js ./
cp ../hozt-live/.env ./
cp ../hozt-live/.gitignore ./
cp -a ../hozt-astro/src/componentsSite ./src/
cp -a ../hozt-astro/src/styles/* ./src/styles/
cp -a ../hozt-astro/src/componentsSite ./src
