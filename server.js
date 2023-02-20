#!/bin/node

var ignoreEnvironment = false
var endLinesWithNull = false
var env = process.env

const NODEJS_BIN = 'node'

// Skip '/bin/node' and '/path/to/env'
var argv = process.argv.slice(2)

// Options
for(; argv.length && argv[0][0] == '-';)
{
  var arg = argv.shift()

  switch(arg)
  {
    case '-':
    case '-i':
    case '--ignore-environment':
      ignoreEnvironment = true;
    break;

    case '-0':
    case '--null':
      endLinesWithNull = true;
    break;

    case '-u':
    case '--unset':
    {
      argv.shift()
      env[argv[0]] = undefined
    }
    break;

    default:
      if(arg.substr(0,8) == '--unset=')
      {
        env[arg.substr(8)] = undefined
        break
      }

      console.error('Unknown option:', arg)
      process.exit(125)
  }
}


// Environment variables
if(ignoreEnvironment)
  process.env = env = {}

for (var m
     ; argv.length
       && (m = argv[0].match('([^=]*)=(.*)')) !== null
     ; argv.shift)
  env[m[1]] = m[2]

// Exec command or show environment variables
var command = argv.shift()

if(command)
{
  command = command.replace(/\s+$/, '')

  if(command === NODEJS_BIN)
  {
    // We are trying to execute a Node.js script, so re-use the current instance.
    // This requires that the Node.js script doesn't do any execution tricks like
    // checking "!module.parent" or "require.main === module". If you want your
    // package to work both as a library and an executable, define it in two
    // different scripts and use package.json "main" and "bin" entries.
    process.argv = [NODEJS_BIN].concat(argv)

    return require(argv[0])
  }

  require('kexec')(command, argv)
  
  console.error('Cannot invoke:', command)
  process.exit(127)
}
else
{
  var endLine = endLinesWithNull ? '\0' : '\n'

  for(var key in env)
    process.stdout.write(key+'='+env[key] + endLine);
}
