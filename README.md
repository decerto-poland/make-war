# make-war

A CLI tool that make war package for the SPA app from static files. Generated war is capable to handle html5 routing.

## Install

```
npm install --global @decerto/make-war
```

or

```
npm install --save-dev @decerto/make-war
```

## Usage

```
$ make-war --help
Usage: make-war

  -c, --config=ARG                    use defaults value for name, version and description from given json file
  -o, --output=ARG                    output file (default is {name}-{version}.war)
  -i, --input-dir=ARG                 root directory from which the files are taken (default is dist)
  -d, --description=ARG               application description
  -n, --name=ARG                      application display name (default is SPA)
  -v, --version=ARG                   application version (default is 0.0.0-SNAPSHOT)
  -p, --pass-through=ARG+             regexp to pass through
  -U, --urlrewritefilter-jar-url=ARG  specify custom location for urlrewritefilter jar (default is http://central.maven.org/maven2/org/tuckey/urlrewritefilter/4.0.3/urlrewritefilter-4.0.3.jar)
  -h, --help                          display this help
```

### with package.json

```
{
    "...": "...",
    "scripts":{
        "...": "...",
        "war": "make-war -n myApplication -d 'My single page application' -o myApp.war"
    }
}
```

**Hint**: You can add script called `"postbuild": "npm run war"`
