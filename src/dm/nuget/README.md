[sius@mount src]$ nuget help install
NuGet Version: 4.4.1.4656
usage: NuGet install packageId|pathToPackagesConfig [options]

Installs a package using the specified sources. If no sources are specified, all sources defined in the NuGet configuration file are used. If the configuration file specifies no sources, uses the default NuGet feed.

     Specify the id and optionally the version of the package to install. If a path to a packages.config file is used instead
     of an id, all the packages it contains are installed.

options:

 -OutputDirectory                     Specifies the directory in which packages will be installed. If none specified, uses the
                                      current directory.
 -Version                             The version of the package to install.
 -DependencyVersion                   Overrides the default dependency resolution behavior.
 -Framework                           Target framework used for selecting dependencies. Defaults to 'Any' if not specified.
 -ExcludeVersion                 (x)  If set, the destination folder will contain only the package name, not the version numbe
                                      r
 -Prerelease                          Allows prerelease packages to be installed. This flag is not required when restoring pac
                                      kages by installing from packages.config.
 -RequireConsent                      Checks if package restore consent is granted before installing a package.
 -SolutionDirectory                   Solution root for package restore.
 -Source +                            A list of packages sources to use for this command.
 -FallbackSource +                    A list of package sources to use as fallbacks for this command.
 -NoCache                             Disable using the machine cache as the first package source.
 -DirectDownload                      Download directly without populating any caches with metadata or binaries.
 -DisableParallelProcessing           Disable parallel processing of packages for this command.
 -PackageSaveMode                     Specifies types of files to save after package installation: nuspec, nupkg, nuspec;nupkg
                                      .
 -Help                           (?)  help
 -Verbosity                           Display this amount of details in the output: normal, quiet, detailed.
 -NonInteractive                      Do not prompt for user input or confirmations.
 -ConfigFile                          The NuGet configuration file. If not specified, file %AppData%\NuGet\NuGet.config is use
                                      d as configuration file.
 -ForceEnglishOutput                  Forces the application to run using an invariant, English-based culture.

examples:

nuget install elmah

nuget install packages.config

nuget install ninject -o c:\foo

For more information, visit http://docs.nuget.org/docs/reference/command-line-reference


# Output

[sius@mount liquer]$ nuget install help
Feeds used:
  https://api.nuget.org/v3/index.json

Installing package 'help' to '/home/sius/dev/liquer'.
  GET https://api.nuget.org/v3/registration3-gz-semver2/help/index.json
  OK https://api.nuget.org/v3/registration3-gz-semver2/help/index.json 459ms


Attempting to gather dependency information for package 'help.1.0.0' with respect to project '/home/sius/dev/liquer', targeting 'Any,Version=v0.0'
Gathering dependency information took 979.61 ms
Attempting to resolve dependencies for package 'help.1.0.0' with DependencyBehavior 'Lowest'
Resolving dependency information took 0 ms
Resolving actions to install package 'help.1.0.0'
Resolved actions to install package 'help.1.0.0'
Retrieving package 'help 1.0.0' from 'nuget.org'.
Retrieving package 'jQuery 2.1.1' from 'nuget.org'.
Retrieving package 'SampleDependency 1.0.0' from 'nuget.org'.
  GET https://api.nuget.org/v3-flatcontainer/jquery/2.1.1/jquery.2.1.1.nupkg
  OK https://api.nuget.org/v3-flatcontainer/jquery/2.1.1/jquery.2.1.1.nupkg 437ms
Installing jQuery 2.1.1.
  GET https://api.nuget.org/v3-flatcontainer/help/1.0.0/help.1.0.0.nupkg
Adding package 'jQuery.2.1.1' to folder '/home/sius/dev/liquer'
Added package 'jQuery.2.1.1' to folder '/home/sius/dev/liquer'
Successfully installed 'jQuery 2.1.1' to /home/sius/dev/liquer
  OK https://api.nuget.org/v3-flatcontainer/help/1.0.0/help.1.0.0.nupkg 125ms
Installing help 1.0.0.
  GET https://api.nuget.org/v3-flatcontainer/sampledependency/1.0.0/sampledependency.1.0.0.nupkg
  OK https://api.nuget.org/v3-flatcontainer/sampledependency/1.0.0/sampledependency.1.0.0.nupkg 441ms
Installing SampleDependency 1.0.0.
Adding package 'SampleDependency.1.0.0' to folder '/home/sius/dev/liquer'
Added package 'SampleDependency.1.0.0' to folder '/home/sius/dev/liquer'
Successfully installed 'SampleDependency 1.0.0' to /home/sius/dev/liquer
Adding package 'help.1.0.0' to folder '/home/sius/dev/liquer'
Added package 'help.1.0.0' to folder '/home/sius/dev/liquer'
Successfully installed 'help 1.0.0' to /home/sius/dev/liquer
Executing nuget actions took 1.48 sec
