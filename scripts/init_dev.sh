#!/bin/bash

if [ "${BASH_ARGC}" != "1" ]
then
  virtualenv_dir="__"
else
  virtualenv_dir="${BASH_ARGV[0]}"
fi

the_basename=`basename \`pwd\``

echo "virtualenv_dir: ${virtualenv_dir} the_basename: ${the_basename}"

if [ ! -d ${virtualenv_dir} ]
then
  echo "no ${virtualenv_dir}. will create one"
  virtualenv -p `which python` --prompt="[${the_basename}] " "${virtualenv_dir}"
fi

source ${virtualenv_dir}/bin/activate
the_python_path=`which python`
echo "python: ${the_python_path}"

echo "current_dir: "
pwd

# remove files from create-react-app
rm src/index.js
rm package.json

# cp all to current dir
rm -rf cc/.git*
ln -s cc/scripts ./
ln -s cc/config.js.tmpl ./

# post setup - git
rm -rf .git

# gitignore
if [ ! -f .gitignore ]
then
    echo "/cc" >> .gitignore
    echo "/${virtualenv_dir}" >> .gitignore
fi

git init; git add .; git commit -m "init dev"

# cookie-cutter
pip install -e git+https://github.com/chhsiao1981/cookiecutter.git#egg=cookiecutter
