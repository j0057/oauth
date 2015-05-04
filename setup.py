#!/usr/bin/env python2.7

repo_names = ['xhttp','xmlist']
dist_names = ['requests']
static_dirs = ['static']

import os
from setuptools import setup

try:
    with open('oauth.egg-info/version.txt', 'r') as f:
        version = f.read()
except:
    version = None

setup(
    author='Joost Molenaar',
    author_email='j.j.molenaar@gmail.com',
    name='oauth',
    packages=['oauth'],
    url='https://github.com/j0057/oauth',
    version=version,
    version_command=('git describe', 'pep440-git'),
    data_files=[ (root, [ root + '/' + fn for fn in files ])
                 for src_dir in static_dirs
                 for (root, dirs, files) in os.walk(src_dir) ],
    install_requires=dist_names+repo_names,
    custom_metadata={
        'x_repo_names': repo_names,
        'x_dist_names': dist_names,
        'x_static_dirs': static_dirs
    })
