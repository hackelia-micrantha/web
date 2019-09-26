package main

import (
	"flag"
	"github.com/wellington/go-libsass"
	"os"
	"path"
	"path/filepath"
	"strings"
)

const (
	cssSuffix = ".css"
)

func help() {
	println("Syntax:", os.Args[0], "")
	println()
	flag.PrintDefaults()
}

var (
	src = flag.String("src", "", "The src path to a sass file or a directory containing sass files")
	dest = flag.String("dest", "", "The dest path to store compiled output")
	sassSuffixes = []string{".sass", ".scss"}
)

func main() {

	flag.Parse()

	if src == nil || dest == nil || len(*src) == 0 || len(*dest) == 0 {
		help()
		os.Exit(1)
	}

	info, err := os.Stat(*dest)

	if err != nil {
		print(err.Error())
		os.Exit(1)
	}

	if !info.IsDir() {
		print("Destination must be a directory")
		os.Exit(1)
	}

	info, err = os.Stat(*src)

	if err = compileSASS(path.Dir(*src), info, err); err != nil {
		print(err.Error())
		os.Exit(1)
	}

	os.Exit(0)
}

func cssFile(value string) string {
	return strings.TrimSuffix(value, path.Ext(value)) + cssSuffix
}

func isSassFile(info os.FileInfo) bool {

	value := path.Ext(info.Name())

	for _, ext := range sassSuffixes {
		if ext == value {
			return true
		}
	}
	return false
}

func openSrc(dir string, info os.FileInfo) (*os.File, error) {
	fileName := path.Join(dir, info.Name())

	return os.Open(fileName)
}

func openDest(info os.FileInfo) (*os.File, error) {
	fileName := path.Join(*dest, cssFile(info.Name()))

	return os.Create(fileName)
}

func compileSASS(input string, info os.FileInfo, err error) error {
	if err != nil {
		return err
	}

	if info.IsDir() {
		return filepath.Walk(input, compileSASS)
	}

	if !isSassFile(info) {
		return nil
	}

	in, err := openSrc(input, info)

	if err != nil {
		return err
	}

	defer in.Close()

	out, err := openDest(info)

	if err != nil {
		return err
	}

	defer out.Close()

	compiler, err := libsass.New(out, in)

	if err != nil {
		return err
	}

	return compiler.Run()
}

