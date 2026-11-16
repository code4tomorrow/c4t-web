"""Records a step-by-step trace of a short Python program for the lesson
"Step through" player. Reads JSON {"code": ..., "input": [...]} on stdin and
prints JSON {"steps": [...], "error": str|None, "truncated": bool}.

Each step is the state just before `line` runs: the call stack (outermost
first) with each frame's variables, and everything printed so far.
"""
import builtins
import io
import json
import sys
import types

MAX_STEPS = 150
request = json.load(sys.stdin)
source = request["code"]
inputs = list(request.get("input") or [])
output = io.StringIO()
steps = []
truncated = False
BASELINE = set(dir(builtins)) | {"__builtins__", "__name__", "__doc__", "__spec__", "__loader__", "__package__", "__annotations__"}


def show(value, depth=0):
    if isinstance(value, types.FunctionType):
        return f"function {value.__name__}()"
    if isinstance(value, type):
        return f"class {value.__name__}"
    if isinstance(value, types.ModuleType):
        return f"module {value.__name__}"
    if type(value).__repr__ is object.__repr__ and hasattr(value, "__dict__"):
        if depth > 1:
            return f"{type(value).__name__}(…)"
        fields = ", ".join(f"{k}={show(v, depth + 1)}" for k, v in vars(value).items())
        text = f"{type(value).__name__}({fields})"
    else:
        try:
            text = repr(value)
        except Exception:
            text = f"<{type(value).__name__}>"
    return text if len(text) <= 90 else text[:87] + "…"


def frame_vars(frame):
    if frame.f_code.co_name == "<module>":
        items = frame.f_globals.items()
        return {k: show(v) for k, v in items if k not in BASELINE and not k.startswith("__") and not isinstance(v, types.ModuleType)}
    return {k: show(v) for k, v in frame.f_locals.items() if not k.startswith("__")}


def snapshot(frame, line, event, ret=None):
    global truncated
    if len(steps) >= MAX_STEPS:
        truncated = True
        raise SystemExit
    stack = []
    current = frame
    while current is not None:
        if current.f_code.co_filename == "<lesson>":
            name = "Global" if current.f_code.co_name == "<module>" else current.f_code.co_name + "()"
            stack.append({"name": name, "vars": frame_vars(current)})
        current = current.f_back
    stack.reverse()
    step = {"line": line, "stack": stack, "out": output.getvalue()}
    if event == "return":
        step["ret"] = show(ret)
    steps.append(step)


def tracer(frame, event, arg):
    if frame.f_code.co_filename != "<lesson>":
        return None
    if event == "line":
        snapshot(frame, frame.f_lineno, event)
    elif event == "return" and frame.f_code.co_name != "<module>":
        snapshot(frame, frame.f_lineno, event, arg)
    return tracer


def fake_input(prompt=""):
    if not inputs:
        raise EOFError("the trace needs more input values")
    value = str(inputs.pop(0))
    output.write(f"{prompt}{value}\n")
    return value


error = None
namespace = {"__name__": "__main__", "__builtins__": builtins}
builtins.input = fake_input
real_stdout = sys.stdout
sys.stdout = output
try:
    code = compile(source, "<lesson>", "exec")
    sys.settrace(tracer)
    exec(code, namespace)
except SystemExit:
    pass
except Exception as exc:
    error = f"{type(exc).__name__}: {exc}"
finally:
    sys.settrace(None)
    sys.stdout = real_stdout

final = {"line": None, "stack": [{"name": "Global", "vars": {k: show(v) for k, v in namespace.items() if k not in BASELINE and not k.startswith("__") and not isinstance(v, types.ModuleType)}}], "out": output.getvalue()}
if error:
    final["error"] = error
steps.append(final)
print(json.dumps({"steps": steps, "error": error, "truncated": truncated}))
