#!/usr/bin/env python

import json
import sys
import logging

from cookiecutter.main import cookiecutter


def underscore_to_uppercase(the_str):
    return the_str.upper()


def underscore_to_camelcase(the_str):
    the_list = the_str.split('_')
    return ''.join([each_str.title() for each_str in the_list])

def underscore_to_lower_camelcase(the_str):
    the_list = the_str.split('_')
    return the_list[0] + ''.join([each_str.title() for each_str in the_list[1:]])

the_module = sys.argv[1]
full_name = sys.argv[2]

logging.warning('full_name: %s', full_name)

full_name_list = full_name.split('.')
if len(full_name_list) == 1:
    pkg = full_name_list[0]
    module = full_name_list[0]
    project = full_name_list[0]

    pkg_name = pkg
    project_name = project
    include_pkg = pkg

    package_dir = '.'
    include_package_dir = "."
    test_package_dir = '.'
else:
    pkg = full_name_list[-1]
    module = full_name_list[-1]
    project = full_name_list[-1]

    pkg_name = pkg
    project_name = project
    include_pkg = pkg

    package_dir = '/'.join(full_name_list[:-1])
    include_package_dir = '/'.join([each_pkg for each_pkg in full_name_list[:-1]])
    test_package_dir = '/'.join(['test_' + each_pkg for each_pkg in full_name_list[:-1]])


the_dict = {
    'pkg': pkg,
    'module': module,
    # 'project': project,

    'pkg_name': pkg_name,
    'project_name': project_name,

    'include_pkg': include_pkg,

    'package_dir': package_dir,
    'include_package_dir': include_package_dir,
    'test_package_dir': test_package_dir,

    'PKG': underscore_to_uppercase(pkg),
    'MODULE': underscore_to_uppercase(module),
    'PROJECT': underscore_to_camelcase(project),
    'PKG_NAME': underscore_to_uppercase(pkg_name),
    'PROJECT_NAME': underscore_to_camelcase(project_name),
    'INCLUDE_PKG': underscore_to_uppercase(include_pkg),
    'PACKAGE_DIR': underscore_to_uppercase(package_dir),
    'INCLUDE_PACKAGE_DIR': underscore_to_uppercase(include_package_dir),
    'TEST_PACKAGE_DIR': underscore_to_uppercase(test_package_dir),

    'Pkg': underscore_to_camelcase(pkg),
    'Module': underscore_to_camelcase(module),
    'Project': underscore_to_camelcase(project),
    'PkgName': underscore_to_camelcase(pkg_name),
    'ProjectName': underscore_to_camelcase(project_name),
    'IncludePkg': underscore_to_camelcase(include_pkg),
    'PackageDir': underscore_to_camelcase(package_dir),
    'IncludePackageDir': underscore_to_camelcase(include_package_dir),
    'TestPackageDir': underscore_to_camelcase(test_package_dir),

    'pkgLCamel': underscore_to_lower_camelcase(pkg),
    'moduleLCamel': underscore_to_lower_camelcase(module),
    'projectLCamel': underscore_to_lower_camelcase(project),
    'pkgName': underscore_to_lower_camelcase(pkg_name),
    'projectName': underscore_to_lower_camelcase(project_name),
    'includePkg': underscore_to_lower_camelcase(include_pkg),
    'packageDir': underscore_to_lower_camelcase(package_dir),
    'includePackageDir': underscore_to_lower_camelcase(include_package_dir),
    'testPackageDir': underscore_to_lower_camelcase(test_package_dir)
}

cookiecutter(
    'cc/' + the_module,
    extra_context=the_dict,
    no_input=True,
    overwrite_if_exists=True,
    skip_if_file_exists=True,
)
