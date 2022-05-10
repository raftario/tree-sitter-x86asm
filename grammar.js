module.exports = grammar({
  name: "x86asm",

  rules: {
    source_file: ($) => $.toplevel_item,

    toplevel_item: ($) => repeat1($.statement),

    statement: ($) => seq(choice($.comment, $.directive), $._NEWLINE),

    comment: ($) => /;.*/,
    directive: ($) =>
      choice(
        $.objdump_section_label,
        $.objdump_offset_label,
        $.section,
        $.extern,
        $.global,
        $.builtin,
        $.ins,
        $.label,
      ),

    builtin: ($) => seq($.builtin_kw, $.operand_args),
    builtin_kw: ($) => choice("db", "dw", "dd", "dq"),

    section: ($) => seq("section", $.section_name, optional("info")),
    extern: ($) => seq("extern", $.identifier),
    global: ($) => seq("global", $.identifier),

    objdump_section_label: ($) =>
      seq($.objdump_section_addr, "<", $.identifier, ">", ":"),
    objdump_section_addr: ($) => token.immediate(/[0-9a-fA-F]+/),

    objdump_offset_label: ($) =>
      seq($.objdump_offset_addr, ":", repeat(/[0-9a-fA-F]{2}/), $.ins),
    objdump_machine_code_bytes: ($) => /[0-9a-fA-F]{2}\s/,
    objdump_offset_addr: ($) => seq(/\s+/, /[0-9a-fA-F]+/),

    label: ($) => seq($.identifier, ":", optional($.directive)),
    ins: ($) => seq($.ins_kw, optional($.operand_args)),

    width: ($) => choice("byte", "word", "dword", "qword"),

    operand_args: ($) => seq($.operand, repeat(seq(",", $.operand))),

    operand: ($) =>
      seq(
        optional($.width),
        optional("ptr"),
        choice(
          $.register,
          $.effective_addr,
          $.string_literal,
          $.integer_literal,
          $.operand_ident,
        ),
      ),

    register: ($) =>
      choice(
        $.register_8bit,
        $.register_16bit,
        $.register_32bit,
        $.register_64bit,
        $.register_simd,
      ),

    register_8bit: ($) =>
      choice("ah", "bh", "ch", "dh", "al", "bl", "cl", "dl"),

    register_16bit: ($) =>
      choice("ax", "bx", "cx", "dx", "di", "si", "sp", "bp"),

    register_32bit: ($) =>
      choice("eax", "ebx", "ecx", "edx", "edi", "esi", "esp", "ebp"),

    register_64bit: ($) =>
      choice(
        choice("rax", "rbx", "rcx", "rdx", "rdi", "rsi", "rsp", "rbp"),
        choice("r8", "r9", "r10", "r11", "r12", "r13", "r14", "r15"),
      ),

    register_simd: ($) =>
      choice(
        choice("xmm0", "xmm1", "xmm2", "xmm3", "xmm4", "xmm5", "xmm6", "xmm7"),
        choice("ymm0", "ymm1", "ymm2", "ymm3", "ymm4", "ymm5", "ymm6", "ymm7"),
      ),

    operand_ident: ($) => $._IDENTIFIER,

    effective_addr: ($) =>
      seq(
        "[",
        repeat1(
          choice(
            $.segment_prefix,
            $.register,
            $.integer_literal,
            "(",
            ")",
            "*",
            "+",
            "-",
            $._IDENTIFIER,
          ),
        ),
        "]",
      ),

    segment_prefix: ($) => seq($.segment, ":"),

    segment: ($) => choice("cs", "ds", "es", "fs", "gs", "ss"),

    // shamelessly stolen from <https://github.com/tree-sitter/tree-sitter-c/>
    escape_sequence: ($) =>
      token(
        prec(
          1,
          seq(
            "\\",
            choice(
              /[^xuU]/,
              /\d{2,3}/,
              /x[0-9a-fA-F]{2,}/,
              /u[0-9a-fA-F]{4}/,
              /U[0-9a-fA-F]{8}/,
            ),
          ),
        ),
      ),

    string_literal: ($) =>
      seq(
        '"',
        repeat(
          choice(token.immediate(prec(1, /[^\\"\n]+/)), $.escape_sequence),
        ),
        '"',
      ),

    integer_literal: ($) =>
      choice(
        $._decimal_literal,
        $._octal_literal,
        $._hex_literal,
        $._binary_literal,
      ),

    _decimal_literal: ($) => choice(/[0-9]+d/, /0d[0-9]+/, /[0-9]+/),

    _hex_literal: ($) =>
      choice(/[0-9a-fA-F]+h/, /\$0[0-9a-fA-F]+/, /0[xh][0-9a-fA-F]+/),

    _octal_literal: ($) => choice(/[0-7]+[qo]/, /0[oq][0-7]+/),

    _binary_literal: ($) => choice(/[01_]+[by]/, /0[by][01_]+/),

    section_name: ($) => /[.]\S+/,
    identifier: ($) => $._IDENTIFIER,
    _IDENTIFIER: ($) => /[A-Za-z0-9.@_-]+/,

    _NEWLINE: ($) => seq(optional($.comment), choice("\n", "\r\n")),

    ins_kw: ($) =>
      choice(
        $.ins_8086,
        $.ins_80186,
        $.ins_80286,
        $.ins_80386,
        $.ins_80486,
        $.ins_pentium,
        $.ins_pentium_mmx,
        $.ins_amd_k6,
        $.ins_pentium_pro,
        $.ins_pentium_2,
        $.ins_sse_non_simd,
        $.ins_sse2,
        $.ins_sse3,
        $.ins_sse4_2,
        $.ins_x86_64,
        $.ins_bitmanip,
        $.ins_clmul,
        $.ins_adx,
        $.ins_intel_tsx,
        $.ins_intel_mpx,
        $.ins_intel_cet,
        $.ins_8087,
        $.ins_80287,
        $.ins_80387,
        $.ins_pentium_pro,
        $.ins_sse,
        $.ins_sse3,
        $.ins_mmx,
        $.ins_mmx_plus_and_sse,
        $.ins_mmx_sse2,
        $.ins_3dnow,
        $.ins_3dnow_plus,
        $.ins_geode_gx,
        $.ins_sse_pentium3,
        $.ins_sse2_pentium4,
        $.ins_sse3_pentium4,
        $.ins_sse4_1,
        $.ins_sse4a,
        $.ins_sse4_2_nehalem,
        $.ins_f16c,
        $.ins_fma3,
        $.ins_fma4,
        $.ins_avx,
        $.ins_avx2,
        $.ins_avx512,
        $.ins_intel_aes,
        $.ins_rdrand,
        $.ins_intel_sha,
        $.ins_virt_amd_v,
        $.ins_virt_vt_x,
        $.ins_undoc,
      ),

    ins_8086: ($) =>
      choice(
        "aaa",
        "aad",
        "aam",
        "aas",
        "adc",
        "add",
        "and",
        "call",
        "cbw",
        "clc",
        "cld",
        "cli",
        "cmc",
        "cmp",
        "cmpsb",
        "cmpsw",
        "cwd",
        "daa",
        "das",
        "dec",
        "div",
        "esc",
        "hlt",
        "idiv",
        "imul",
        "in",
        "inc",
        "int",
        "into",
        "iret",

        "jo",
        "jno",
        "js",
        "jns",
        "je",
        "jz",
        "jne",
        "jnz",
        "jb",
        "jnae",
        "jc",
        "jnb",
        "jae",
        "jnc",
        "jbe",
        "jna",
        "ja",
        "jnbe",
        "jl",
        "jjnge",
        "jge",
        "jnl",
        "jle",
        "jng",
        "jg",
        "jnle",
        "jp",
        "jpe",
        "jpo",
        "jcxz",

        "jmp",
        "lahf",
        "lds",
        "lea",
        "les",
        "lock",
        "lodsb",
        "lodsw",
        choice("loop", "loope", "loopne", "loopnz", "loopz"),
        "mov",
        "movsb",
        "movsw",
        "mul",
        "neg",
        "nop",
        "not",
        "or",
        "out",
        "pop",
        "popf",
        "push",
        "pushf",
        "rcl",
        "rcr",
        choice("rep", "repe", "repne", "repnz", "repz"),
        "ret",
        "retn",
        "retf",
        "rol",
        "ror",
        "sahf",
        "sal",
        "sar",
        "sbb",
        "scasb",
        "scasw",
        "shl",
        "shr",
        "stc",
        "std",
        "sti",
        "stosb",
        "stosw",
        "sub",
        "test",
        "wait",
        "xchg",
        "xlat",
        "xor",
      ),

    ins_80186: ($) =>
      choice(
        "bound",
        "enter",
        "insb",
        "insw",
        "leave",
        "outsb",
        "outsw",
        "popa",
        "pusha",
      ),

    ins_80286: ($) =>
      choice(
        "arpl",
        "clts",
        "lar",
        "lsl",
        "lgdt",
        "lidt",
        "lldt",
        "ltr",
        "lmsw",
        "sgdt",
        "sidt",
        "sldt",
        "smsw",
        "str",
        "verr",
        "verw",
        "loadall",
      ),

    ins_80386: ($) =>
      choice(
        "bsf",
        "bsr",
        "bt",
        "btc",
        "btr",
        "bts",
        "cdq",
        "cmpsd",
        "cwde",
        "ibts",
        "insd",
        "iretd",
        "lfs",
        "lgs",
        "lss",
        "lodsd",
        "loopw",
        "loopd",
        "movsd",
        "movsx",
        "movzx",
        "outsd",
        "popad",
        "popfd",
        "pushad",
        "pushfd",
        "pushd",
        "scasd",
        choice(
          "seta",
          "setae",
          "setb",
          "setbe",
          "setc",
          "sete",
          "setg",
          "setge",
          "setl",
          "setle",
          "setna",
          "setnae",
          "setnb",
          "setnbe",
          "setnc",
          "setne",
          "setng",
          "setnge",
          "setnl",
          "setnle",
          "setno",
          "setnp",
          "setns",
          "setnz",
          "seto",
          "setp",
          "setpe",
          "setpo",
          "sets",
          "setz",
        ),
        "shld",
        "shrd",
        "stosd",
        "xbts",
      ),

    ins_80486: ($) =>
      choice("bswap", "cmpxchg", "invd", "invlpg", "wbinvd", "xadd"),

    ins_pentium: ($) =>
      choice("cpuid", "cmpxchg8b", "rdmsr", "rdtsc", "wrmsr", "rsm"),

    ins_pentium_mmx: ($) => choice("rdpmc"),

    ins_amd_k6: ($) => choice("syscall", "sysret"),

    ins_pentium_pro: ($) =>
      choice(
        choice(
          "cmova",
          "cmovae",
          "cmovb",
          "cmovbe",
          "cmovc",
          "cmove",
          "cmovg",
          "cmovge",
          "cmovl",
          "cmovle",
          "cmovna",
          "cmovnae",
          "cmovnb",
          "cmovnbe",
          "cmovnc",
          "cmovne",
          "cmovng",
          "cmovnge",
          "cmovnl",
          "cmovnle",
          "cmovno",
          "cmovnp",
          "cmovns",
          "cmovnz",
          "cmovo",
          "cmovp",
          "cmovpe",
          "cmovpo",
          "cmovs",
          "cmovz",
        ),
        "ud2",
        "nop",
      ),

    ins_pentium_2: ($) => choice("sysenter", "sysexit"),

    ins_sse_non_simd: ($) =>
      choice("prefetcht0", "prefetcht1", "prefetcht2", "prefetchnta", "sfence"),

    ins_sse2: ($) => choice("clflush", "lfence", "mfence", "movnti", "pause"),

    ins_sse3: ($) => choice("monitor", "mwait"),

    ins_sse4_2: ($) => choice("crc32"),

    ins_x86_64: ($) =>
      choice(
        "cdqe",
        "cqo",
        "cmpsq",
        "cmpxchg16b",
        "iretq",
        "jrcxz",
        "lodsq",
        "movxsd",
        "popfq",
        "pushfq",
        "rdtscp",
        "scasq",
        "stosq",
        "swapgs",
      ),

    ins_bitmanip: ($) =>
      choice(
        "lzcnt",
        "popcnt",
        "andn",
        "bextr",
        "blsi",
        "blsmsk",
        "blsr",
        "tzcnt",
        "bzhi",
        "mulx",
        "pdep",
        "pext",
        "rorx",
        "sarx",
        "shrx",
        "shlx",
        "bextr",
        "blcfill",
        "blci",
        "blcic",
        "blcmsk",
        "blcs",
        "blsfill",
        "blsic",
        "t1mskc",
        "tzmsk",
      ),

    ins_clmul: ($) =>
      choice(
        "pclmulqdq",
        "pclmullqlqdq",
        "pclmulhqlqdq",
        "pclmullqhqdq",
        "pclmulhqhqdq",
      ),

    ins_adx: ($) => choice("adcx", "adox"),

    ins_intel_tsx: ($) =>
      choice("xbegin", "xend", "xabort", "xacquire", "xrelease"),

    ins_intel_mpx: ($) =>
      choice(
        "bmdmk",
        "bndcl",
        "bndcu",
        "bndcn",
        "bmdmov",
        "bndldx",
        "bndstx",
        "bnd",
      ),

    ins_intel_cet: ($) =>
      choice(
        "incsspd",
        "incsspq",
        "rdsspd",
        "rdsspq",
        "saveprevssp",
        "rstorssp",
        "wrssd",
        "wrssq",
        "wrussd",
        "wrussq",
        "setssbsy",
        "clrssbsy",
        "endbr32",
        "endbr64",
      ),

    ins_8087: ($) =>
      choice(
        "f2xm1",
        "fabs",
        "fadd",
        "faddp",
        "fbld",
        "fbstp",
        "fchs",
        "fclex",
        "fcom",
        "fcomp",
        "fcompp",
        "fdecstp",
        "fdisi",
        "fdiv",
        "fdivp",
        "fdivr",
        "fdivrp",
        "feni",
        "ffree",
        "fiadd",
        "ficom",
        "ficomp",
        "fidiv",
        "fidivr",
        "fild",
        "fimul",
        "fincstp",
        "finit",
        "fist",
        "fistp",
        "fisub",
        "fisubr",
        "fld",
        "fld1",
        "fldcw",
        "fldenv",
        "fldenvw",
        "fldl2e",
        "fldl2t",
        "fldlg2",
        "fldln2",
        "fldpi",
        "fldz",
        "fmul",
        "fmulp",
        "fnclex",
        "fndisi",
        "fneni",
        "fninit",
        "fnop",
        "fnsave",
        "fnsavew",
        "fnstcw",
        "fnstenv",
        "fnstenvw",
        "fnstsw",
        "fpatan",
        "fprem",
        "fptan",
        "frndint",
        "frstor",
        "frstorw",
        "fsave",
        "fsavew",
        "fscale",
        "fsqrt",
        "fst",
        "fstcw",
        "fstenv",
        "fstenvw",
        "fstp",
        "fstsw",
        "fsub",
        "fsubp",
        "fsubr",
        "fsubrp",
        "ftst",
        "fwait",
        "fxam",
        "fxch",
        "fxtract",
        "fyl2x",
        "fyl2xp1",
      ),

    ins_80287: ($) => choice("fsetpm"),

    ins_80387: ($) =>
      choice(
        "fldenvd",
        "fsaved",
        "fprem1",
        "frstord",
        "fsin",
        "fcos",
        "fsincos",
        "fstenvd",
        "fucom",
        "fucomp",
        "fucompp",
        "frstpm",
        "fnstdw",
        "fnstsg",

        "fsbp0",
        "fsbp1",
        "fsbp2",
        "fsbp3",

        "f4x4",
        "fmul4x4",
        "ftstp",
        "frint2",
        "frichop",
        "frinear",
      ),

    ins_pentium_pro: ($) =>
      choice(
        "fcmovb",
        "fcmovbe",
        "fcmove",
        "fcmovnb",
        "fcmovnbe",
        "fcmovne",
        "fcmovnu",
        "fcmovu",
        "fcomi",
        "fcomip",
        "fucomi",
        "fucomip",
      ),

    ins_sse: ($) => choice("fxrstor", "fxsave"),

    ins_sse3: ($) => choice("fisttp"),

    ins_mmx: ($) =>
      choice(
        "emms",
        "movd",
        "movq",
        "packssdw",
        "packsswb",
        "packuswb",

        "paddb",
        "paddw",
        "paddd",
        "paddq",

        "vpaddb",
        "vpaddw",
        "vpaddd",
        "vpaddq",

        "paddsb",
        "paddsw",
        "paddsd",
        "paddsq",

        "vpaddsb",
        "vpaddsw",
        "vpaddsd",
        "vpaddsq",

        "pand",
        "pandn",
        "por",
        "pxor",

        "pcmpeqb",
        "pcmpeqw",
        "pcmpeqd",

        "pcmpgtb",
        "pcmpgtw",
        "pcmpgtd",

        "pmaddwd",
        "pmulhw",
        "pmullw",

        "psslw",
        "pssld",
        "psslq",

        "psrad",
        "psra2",

        "psrld",
        "psrlw",
        "psrlq",

        "psubb",
        "psubw",
        "psubd",

        "psubsb",
        "psubsw",

        "psubusb",
        "psubusw",

        "punpckhwd",
        "punpckhdq",
        "punpcklbw",
        "punpcklwd",
        "punpckldq",
      ),

    ins_mmx_plus_and_sse: ($) =>
      choice(
        "maskmovq",
        "movntq",
        "pshufw",
        "pinsrw",
        "pextrw",
        "pmovmskb",
        "pminub",
        "pmaxub",
        "pavgb",
        "pavgw",
        "pmulhuw",
        "pminsw",
        "pmaxsw",
        "psadbw",
      ),

    ins_mmx_sse2: ($) =>
      choice(
        "psignb",
        "psignw",
        "psignd",
        "pshufb",
        "pmulhrsw",
        "pmaddubsw",
        "phsubw",
        "phsubsw",
        "phsubd",
        "phaddsw",
        "phaddw",
        "phaddd",
        "palignr",
        "pabsb",
        "pabsw",
        "pbasd",
      ),

    ins_3dnow: ($) =>
      choice(
        "femms",
        "pavgusb",
        "pf2id",
        "pfacc",
        "pfadd",
        "pfcmpeq",
        "pfcmpge",
        "pfcmpgt",
        "pfmax",
        "pfmin",
        "pfmul",
        "pfrcp",
        "pfrcpit1",
        "pfrcpit2",
        "pfrsqit1",
        "pfrsqrt",
        "pfsub",
        "pfsubr",
        "pi2fd",
        "pmulhrw",
        "prefetch",
        "prefetchw",
      ),

    ins_3dnow_plus: ($) =>
      choice("pf2iw", "pi2fw", "pswapd", "pfnacc", "pfpnacc"),

    ins_geode_gx: ($) => choice("pfrcpv", "pfrqsrtv"),

    ins_sse_pentium3: ($) =>
      choice(
        "andps",
        "andnps",
        "orps",
        "xorps",
        "movups",
        "movss",
        "movlps",
        "movhlps",
        "unpcklps",
        "unpckhps",
        "movhps",
        "movlhps",
        "movaps",
        "movntps",
        "movmskps",
        "cvtpi2ps",
        "cvtsi2ss",
        "cvttps2pi",
        "cvttss2si",
        "cvtps2pi",
        "cvtss2si",
        "ucomiss",
        "comiss",
        "sqrtps",
        "sqrtss",
        "rsqrtps",
        "rcpps",
        "rcpss",
        "addps",
        "addss",
        "mulps",
        "mulss",
        "subps",
        "subss",
        "minps",
        "minss",
        "divps",
        "divss",
        "maxps",
        "maxss",
        "ldmxcsr",
        "stmxcsr",
        "cmpps",
        "shufps",
      ),

    ins_sse2_pentium4: ($) =>
      choice(
        "movapd",
        "movntpd",
        "movhpd",
        "movhpd",
        "movlpd",
        "movupd",
        "movmskpd",
        "addpd",
        "addsd",
        "divpd",
        "divsd",
        "maxpd",
        "maxsd",
        "minpd",
        "minsd",
        "mulpd",
        "mulsd",
        "sqrtpd",
        "sqrtsd",
        "subpd",
        "subsd",
        "andpd",
        "andnpd",
        "orpd",
        "xorpd",
        "cmppd",
        "comisd",
        "ucomisd",
        "shufpd",
        "unpckhpd",
        "unpcklpd",
        "cvtdq2pd",
        "cvtdq2ps",
        "cvtpd2dq",
        "cvtpd2pi",
        "cvtpd2ps",
        "cvtpi2pd",
        "cvtps2dq",
        "cvtps2pd",
        "cvtsd2si",
        "cvtsd2ss",
        "cvtsi2sd",
        "cvtss2sd",
        "cvttpd2dq",
        "cvttpd2pi",
        "cvttps2dq",
        "cvttsd2si",
        "paddusb",
        "paddusw",
        "pmuludq",
        "punpckhbw",
        "maskmovdqu",
        "movdq2q",
        "vmovdqa",
        "movdqa",
        "movdqu",
        "vmovdqu",
        "movq2dq",
        "movntdq",
        "pshufhw",
        "pshuflw",
        "pshufd",
        "pslldq",
        "psrldq",
        "punpckhqdq",
        "punpcklqdq",
      ),

    ins_sse3_pentium4: ($) =>
      choice(
        "addsubps",
        "addsubpd",
        "movddup",
        "movsldup",
        "movshdup",
        "haddps",
        "haddpd",
        "hsubps",
        "hsubpd",
        "lddqu",
      ),

    ins_sse3_core2: ($) =>
      choice(
        "psignb",
        "psignw",
        "psignd",
        "pshufb",
        "pmulhrsw",
        "pmaddubsw",
        "phsubw",
        "phsubsw",
        "phsubd",
        "phaddsw",
        "phaddw",
        "phaddd",
        "palignr",
        "pabsb",
        "pabsw",
        "pabsd",
      ),

    ins_sse4_1: ($) =>
      choice(
        "dpps",
        "dppd",
        "blendps",
        "blendvps",
        "blendpd",
        "blendvpd",
        "roundps",
        "roundss",
        "roundpd",
        "roundsd",
        "insertps",
        "extractps",
        "mpsadbw",
        "phminposuw",
        "pmulld",
        "pmuldq",
        "pblendvb",
        "pblendw",
        "pminsb",
        "pminuw",
        "pminsd",
        "pminud",
        "pmaxsb",
        "pmaxuw",
        "pmaxsd",
        "pmaxud",
        "pinsrb",
        "pinsrd",
        "pinsrq",
        "pextrb",
        "pextrd",
        "pextrq",
        "pmovsxbw",
        "pmovzxbw",
        "pmovsxbd",
        "pmovzxbd",
        "pmovsxbq",
        "pmovzxbq",
        "pmovsxwd",
        "pmovzxwd",
        "pmovsxwq",
        "pmovzxwq",
        "pmovsxdq",
        "pmovzxdq",
        "ptest",
        "pcmpeqq",
        "packusdw",
        "monvtdqa",
      ),

    ins_sse4a: ($) => choice("extrq", "insertq", "movntsd", "movntss"),

    ins_sse4_2_nehalem: ($) =>
      choice("pcmpestri", "pcmpestrm", "pcmpistri", "pcmpistrm", "pcmpgtq"),

    ins_f16c: ($) => choice("vcvtph2ps", "vcvtps2ph"),

    ins_fma3: ($) =>
      choice(
        "vfmadd132pd",
        "vfmadd132ps",
        "vfmadd132sd",
        "vfmadd132ss",
        "vfmadd213pd",
        "vfmadd213ps",
        "vfmadd213sd",
        "vfmadd213ss",
        "vfmadd231pd",
        "vfmadd231ps",
        "vfmadd231sd",
        "vfmadd231ss",
        "vfmaddsub132pd",
        "vfmaddsub132ps",
        "vfmaddsub132sd",
        "vfmaddsub132ss",
        "vfmaddsub213pd",
        "vfmaddsub213ps",
        "vfmaddsub213sd",
        "vfmaddsub213ss",
        "vfmaddsub231pd",
        "vfmaddsub231ps",
        "vfmaddsub231sd",
        "vfmaddsub231ss",
        "vfmsub132pd",
        "vfmsub132ps",
        "vfmsub132sd",
        "vfmsub132ss",
        "vfmsub213pd",
        "vfmsub213ps",
        "vfmsub213sd",
        "vfmsub213ss",
        "vfmsub231pd",
        "vfmsub231ps",
        "vfmsub231sd",
        "vfmsub231ss",
        "vfmsubadd132pd",
        "vfmsubadd132ps",
        "vfmsubadd132sd",
        "vfmsubadd132ss",
        "vfmsubadd213pd",
        "vfmsubadd213ps",
        "vfmsubadd213sd",
        "vfmsubadd213ss",
        "vfmsubadd231pd",
        "vfmsubadd231ps",
        "vfmsubadd231sd",
        "vfmsubadd231ss",

        "vfnmadd132pd",
        "vfnmadd132ps",
        "vfnmadd132sd",
        "vfnmadd132ss",
        "vfnmadd213pd",
        "vfnmadd213ps",
        "vfnmadd213sd",
        "vfnmadd213ss",
        "vfnmadd231pd",
        "vfnmadd231ps",
        "vfnmadd231sd",
        "vfnmadd231ss",
        "vfnmaddsub132pd",
        "vfnmaddsub132ps",
        "vfnmaddsub132sd",
        "vfnmaddsub132ss",
        "vfnmaddsub213pd",
        "vfnmaddsub213ps",
        "vfnmaddsub213sd",
        "vfnmaddsub213ss",
        "vfnmaddsub231pd",
        "vfnmaddsub231ps",
        "vfnmaddsub231sd",
        "vfnmaddsub231ss",
        "vfnmsub132pd",
        "vfnmsub132ps",
        "vfnmsub132sd",
        "vfnmsub132ss",
        "vfnmsub213pd",
        "vfnmsub213ps",
        "vfnmsub213sd",
        "vfnmsub213ss",
        "vfnmsub231pd",
        "vfnmsub231ps",
        "vfnmsub231sd",
        "vfnmsub231ss",
        "vfnmsubadd132pd",
        "vfnmsubadd132ps",
        "vfnmsubadd132sd",
        "vfnmsubadd132ss",
        "vfnmsubadd213pd",
        "vfnmsubadd213ps",
        "vfnmsubadd213sd",
        "vfnmsubadd213ss",
        "vfnmsubadd231pd",
        "vfnmsubadd231ps",
        "vfnmsubadd231sd",
        "vfnmsubadd231ss",
      ),
    // /vf(n?)m(add|addsub|sub|subadd)(132|213|231)(pd|ps|sd|ss)/

    ins_fma4: ($) =>
      choice(
        "vfmaddpd",
        "vfmaddps",
        "vfmaddsd",
        "vfmaddss",
        "vfmaddsubpd",
        "vfmaddsubps",
        "vfmaddsubsd",
        "vfmaddsubss",
        "vfmsubpd",
        "vfmsubps",
        "vfmsubsd",
        "vfmsubss",
        "vfmsubaddpd",
        "vfmsubaddps",
        "vfmsubaddsd",
        "vfmsubaddss",

        "vfnmaddpd",
        "vfnmaddps",
        "vfnmaddsd",
        "vfnmaddss",
        "vfnmaddsubpd",
        "vfnmaddsubps",
        "vfnmaddsubsd",
        "vfnmaddsubss",
        "vfnmsubpd",
        "vfnmsubps",
        "vfnmsubsd",
        "vfnmsubss",
        "vfnmsubaddpd",
        "vfnmsubaddps",
        "vfnmsubaddsd",
        "vfnmsubaddss",
      ),
    // /vf(n?)m(add|addsub|subadd|sub)(pd|ps|sd|ss)/

    ins_avx: ($) =>
      choice(
        "vbroadcastss",
        "vbroadcastsd",
        "vbroadcastf128",

        "vinsertf128",
        "vextractf128",

        "vmaskmovps",
        "vmaskmovpd",

        "vpermilps",
        "vpermilpd",

        "vperm2f128",
        "vzeroall",
        "vzeroupper",
      ),

    ins_avx2: ($) =>
      choice(
        "vpbroadcastb",
        "vpbroadcastw",
        "vpbroadcastd",
        "vpbroadcastq",
        "vbroadcasti128",
        "vinserti128",
        "vextracti128",

        "vgatherdpd",
        "vgatherqpd",
        "vgatherdps",
        "vgatherqps",

        "vpgatherdd",
        "vpgatherdq",
        "vpgatherqd",
        "vpgatherqq",

        "vpmaskmovd",
        "vpmaskmovq",

        "vpermps",
        "vpermd",
        "vpermpd",
        "vpermq",
        "vperm2i128",

        "vpblendd",

        "vpsllvd",
        "vpsllvq",
        "vpsrlvd",
        "vpsrlvq",
        "vpsravd",
      ),

    ins_avx512: ($) =>
      choice(
        "vblendmpd",
        "vblendmps",

        "vpblendmd",
        "vpblendm1",

        "vpcmpd",
        "vpcmpud",

        "vpcmpq",
        "vpcmpiq",

        "vptestmd",
        "vptestmq",
        "vptestnmd",
        "vptestnmq",

        "vcompresspd",
        "vcompressps",
        "vpcompressd",
        "vpcompressq",

        "vexpandpd",
        "vexpandps",
        "vpexpandd",
        "vpexpandq",

        "vpermi2pd",
        "vpermi2ps",
        "vpermi2d",
        "vpermi2q",

        "vpermt2ps",
        "vpermt2pd",
        "vpermt2d",
        "vpermt2q",

        "vpermt2ps",
        "vpermt2pd",
        "vpermt2d",
        "vpermt2q",

        "vshuff32x4",
        "vshuff64x4",
        "vshuffi32x4",
        "vshuffi64x4",

        "vpternlogd",
        "vpternlogq",

        "vpmovqd",
        "vpmovqw",
        "vpmovqb",
        "vpmovsqd",
        "vpmovsqw",
        "vpmovsqb",
        "vpmovusqd",
        "vpmovusqw",
        "vpmovusqb",

        "vpmovdw",
        "vpmovdb",
        "vpmovsdw",
        "vpmovsdb",
        "vpmovusdw",
        "vpmovusdb",

        "vcvps2udq",
        "vcvpd2udq",
        "vcvtps2udq",
        "vcvtpd2udq",

        "vcvtudq2ps",
        "vcvtudq2pd",

        "vcvtusi2ps",
        "vcvtusi2pd",
        "vcvtusi2sd",
        "vcvtusi2ss",

        "vcvtqq2pd",
        "vcvtqq2ps",

        "vgetexppd",
        "vgetexpps",
        "vgetexpsd",
        "vgetexpss",

        "vgetmantpd",
        "vgetmantps",
        "vgetmantsd",
        "vgetmantss",

        "vfixupimmpd",
        "vfixupimmps",
        "vfixupimmsd",
        "vfixupimmss",

        "vrcp14pd",
        "vrcp14ps",
        "vrcp14sd",
        "vrcp14ss",

        "vrndscalepd",
        "vrndscaleps",
        "vrndscalesd",
        "vrndscaless",

        "vrsqrt14pd",
        "vrsqrt14ps",
        "vrsqrt14sd",
        "vrsqrt14ss",

        "vscalefpd",
        "vscalefps",
        "vscalefsd",
        "vscalefss",

        "valignd",
        "valignq",

        "vpabsq",

        "vpmaxsq",
        "vpmaxuq",

        "vpminsq",
        "vpminuq",

        "vprold",
        "vprolq",
        "vprolvd",
        "vprolvq",

        "vprord",
        "vprorq",
        "vprorvd",
        "vprorvq",

        "vpscatterdd",
        "vpscatterdq",
        "vpscatterqd",
        "vpscatterqq",

        "vscatterdpd",
        "vscatterdps",
        "vscatterqps",
        "vscatterqpd",
      ),

    ins_intel_aes: ($) =>
      choice(
        "aesenc",
        "aesenclast",
        "aesdec",
        "aesdeclast",
        "aeskeygenassist",
        "aesimc",
      ),

    ins_rdrand: ($) => choice("rdrand", "rdseed"),

    ins_intel_sha: ($) =>
      choice(
        "sha1rnds4",
        "sha1nexte",
        "sha1msg1",
        "sha1msg2",
        "sha256rnds2",
        "sha256msg1",
        "sha256msg2",
      ),

    ins_virt_amd_v: ($) =>
      choice(
        "clgi",
        "invlpga",
        "skinit",
        "stgi",
        "vmload",
        "vmmcall",
        "vmrun",
        "vmsave",
      ),

    ins_virt_vt_x: ($) =>
      choice(
        "invept",
        "invvpid",
        "vmfunc",
        "vmptrld",
        "vmptrst",
        "vmclear",
        "vmread",
        "vmwrite",
        "vmcall",
        "vmlaunch",
        "vmresume",
        "vmxoff",
        "vmxon",
      ),

    ins_undoc: ($) =>
      choice(
        "setalc",
        seq("rep", "ret"),
        "icebp",
        "int1",
        "ud1",
        "ud0",
        "saveall",
        "storeall",
        "loadalld",
        "cl1invmb",
        "patch2",
        "patch3",
        "umov",
        "scall",
        "nxop",
        "pswapw",
        "altinst",
        seq("rep", "xsha512"),
        seq("rep", "xmodexp"),
        "xrng2",
        "montmul2",
        "ffreep",
        "fstpnce",
        "feni8087_nop",
        "fdisi8087_nop",
        "fsetpm287_nop",
      ),
  },
});
