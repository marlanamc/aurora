// build.rs runs before compiling your Rust code
// It's like a pre-build script in npm
// Tauri uses this to generate code and check configurations

fn main() {
    tauri_build::build()
}
